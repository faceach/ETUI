#!/usr/bin/perl
use 5.8.8;
use warnings;
use strict;
use File::Basename;
use File::Spec::Unix;
use Getopt::Long;
use Cwd qw(realpath);
sub say { print shift(),"\n"; }
sub hr  { '-'x50; }

our $VERSION = 1.7;
######COMMAND LINE##########

#define default variables

my @packages   = ();
my @vars       = ();
my %commandlineconstants=();
my $out        = '.';
my $outname    = '';
my $compress   = 'none';
my $input      = '';#current directory
my $configfile = '';

my %minifiers = (
    'JavaScript::Packer'  => 'packer',
    'JavaScript::Minifier'=> 'mini',
    'Javascript::Closure' => 'closure'
);

my %__options__ =(
	'packages:s{,}' => \@packages,
    'vars:s{,}'     => \@vars,
    'define:s{,}'   => \%commandlineconstants,
    'output=s'      => \$out,
    'compression=s' => \$compress,
    'input=s'       => \$input
);
if(-e 'config.jsm') {
	add_arguments(realpath('config.jsm'));
}
if(@ARGV > 0 && $ARGV[0] eq '-config') {
	add_arguments(realpath($ARGV[1]));
}


#get command line options
GetOptions (%__options__);


my $packages    = (@packages) ? join ' ',@packages : 'all';

#get preprocessor variables
my $varLookup = { map { $_ => 1 } @vars };

#check for the compression type
my @compressions = check_available_compression();
if(@compressions==0) {
    $compress   = 'none';
    my @modules = keys %minifiers;
    say "No compressor module available. Install one of the following module: @modules";
}

my $reg = join ('|',values %minifiers);
if($compress ne 'none' && !(grep /^$reg$/,$compress)){
    $compress = 'none';
    say 'Specified compression is not supported...';
    if(@compressions>0){
        say 'Choose between: '.join(',',@compressions);
    }
}

$input             = realpath($input);
($outname,$out)    = fileparse($out);
$out               = realpath($out);
if(length($outname)==0 || $outname!~m/\.js$/){
    $outname='output.js';
}

say hr;
say hr;
say 'Input Folder    :'.$input;
say 'Output Folder   :'.$out;
say 'Output File Name:'.$outname;
say 'Packages        :'.$packages;
say 'Compression type:'.$compress;
my @variables        = keys %$varLookup;
say 'Variables       :'.join(',',(keys %$varLookup));
say hr;
say hr;

if(@packages>0){
    say 'Converting packages name to file path ...';
    map { 
        $_=package2path($_); 
    } @packages;
    say "Got: @packages";
}

say 'Building dependency tree...';
my ($hash,$output)= build_dependency_tree(\&load_dependency);

$output = parse($output);

say 'Outputing the data...';
my $outputfullpath=File::Spec::Unix->catfile($out,$outname);
open (FILE,'>',$outputfullpath) || die "Error:$out";
print FILE $output;
close FILE;
say 'The raw dump is ready at '.$outputfullpath.' '. -s $outputfullpath;

if($compress ne 'none'){
    say "Starting $compress compression...";
    $outname=~s/\.js//;
    my $filename = "$outname-$compress.js";
    $outputfullpath=File::Spec::Unix->catfile($out,$filename);
    open FILE,'>',$outputfullpath || die $!;
    no strict 'refs';
    print FILE &$compress($output);
    use strict;
    close FILE;
    say "The $compress compressed dump is ready at $outputfullpath".' '. -s $outputfullpath;
}

say "Done.";

exit;

####MINIFIERS####

sub check_available_compression {
    my @available =();
    foreach my $package (keys %minifiers){
        eval("use $package;");
        my $e = $@;
        push @available,$minifiers{$package} if(!$e);
    }
    return @available;
}

sub mini {
    return JavaScript::Minifier::minify(input=>shift);
}
sub packer {
    return JavaScript::Packer::minify(\shift,{compress=>'best'});
}
sub closure {
    return Javascript::Closure::minify(input=>shift);
}

###COMMAND LINE###
sub add_arguments {
	my $configfile = shift;
    open (FILE,'<',$configfile) || die 'Could not open:'.$configfile;
    while(<FILE>){
		chomp;
		my ($key,$val) =split /:/;
		if(my $var = $__options__{$key.':s{,}'}){
			my @matches = split /\s+/,$val;
			unshift @$var,@matches;
		}
		else {
			unshift @ARGV, '-'.$key,$val;
		}
    }
    close FILE;
}

####DEPENDENCY TREE BUILDER####

sub build_dependency_tree {
    my $callback = shift;

    my $tree     = {};
    my $lib         = $input;
    traverse($lib,sub {

        my $file = shift;
        $file=~s{$lib}{};

        my $ret = get_package_dependencies($lib,$file);
        $tree->{path2package($file)}= $ret if($ret);

    },sub {
		use Data::Dumper;

        &$callback($tree);
    });
}

sub load_dependency {
    my ($tree,$loaded,$output) = @_;

    $loaded = {} if(!$loaded);
    $output = '' if(!$output);
    my $lib = $input;

    while(my($package,$dependencies)=each %{$tree}){

        next if($loaded->{$package});

        foreach my $dep (@$dependencies){

            next if($loaded->{$dep} || $dep eq $package);

            if($tree->{$dep} && @{$tree->{$dep}}>0){
				 die "cyclic interdependence found: $dep requires $package that requires $dep that requires..." if(grep(/^$package$/,@{$tree->{$dep}}));
                 ($loaded,$output) = load_dependency({"$dep"=>$tree->{$dep}},$loaded,$output);
            }
            else {
                my $ret = get_package_dependencies($lib,$lib.package2path($dep),1);
				die "cyclic interdependence found: $dep requires $package that requires $dep that requires..." if(grep(/^$package$/,@$ret));
                if($ret){
                     ($loaded,$output) = load_dependency({"$dep"=>$ret},$loaded,$output);
                }else {
                    say 'loading '. $dep;
                    $output.=load_package($dep);
                    $loaded->{$dep}=1;
                }
            }
        }
        if(!$loaded->{$package}){
            say 'loading '. $package;
            $output.=load_package($package);
            $loaded->{$package}=1;
        }
    }
    return ($loaded,$output);
}

sub get_package_dependencies {
        my @files=();
        my ($lib,$file,$force) = @_;

        $file=~s{$lib}{};

        return undef if($file=~m/$out$/ || $file=~m/-src/);
        return undef if(@packages>0 && !(grep /$file$/,@packages) && !$force);

        open (FILE,'<',File::Spec::Unix->catfile($lib,$file)) || die File::Spec::Unix->catfile($lib,$file);
        my @lines = <FILE>;
        close FILE;

        $file = path2package($file);

        my $require = $lines[0];
        return undef if($require!~m{require:});

        $require=~s{/\*\!require:\s*|\*/\s*$}{}g;
        my @dependencies = split /\s*,\s*/,$require;
        map { $_=~s/^\s+|\s+$// } @dependencies;
        return \@dependencies;
}


sub load_package {
    my $package = package2path(shift);
    open(FILE,'<',File::Spec::Unix->catfile($input,$package)) || die "$!: $package\n";
    my $lines =join '', <FILE>;
    close FILE;
    return  $lines."\n";
}

sub path2package {
    my $path = shift;
    $path=~s/\///;    # get rid of the first /
    $path=~s/\//./g;  # replace all the others by a dot
    $path=~s/\.js//;  # get rid of the extension
    return $path;
}

sub package2path {
    return File::Spec::Unix->catfile('',(split /\./,shift())).'.js';
}

sub traverse {
    my ($dir,$callback,$complete) = @_;
    my @docs =glob(File::Spec::Unix->catfile($dir,'*'));

    foreach my $doc (@docs){
        if(-f $doc) {
            &$callback($doc);
        }
        else {
            traverse($doc,$callback);
            next;
        }
    }
    &$complete() if($complete);    
}


####PREPROCESSOR#####
my $count= 0;
sub parse {
    my $js = shift;

    #conditional statements
    $js=~s{(/\*[#@]([a-z]+?) ([A-Z_-]+) \*/(.*?)/\*[#@]end \*/)}{ token($4,$2,$3,$1); }gmsoe;

    $js=~s{function\s+\$_(.+?)\s*\(}{function(}gmo if($varLookup->{TRUE_ANON});

    if($varLookup->{NAME_ANON}){
        my $pref='$_';
        my %names=();
        use re 'eval';
        $js=~s/([a-zA-Z$_]{1}[a-zA-Z0-9$_]*)\s*([:=])\s*(?:function\s*\()(?{ $names{$1}++; })/$1 $2 function $pref$1$names{$1} (/gmo;

        my $anon = $pref.'anon';
        $js=~s/(?:function\s*\()(?{ $count++; })/function $anon$count (/gmo;
    }

    #defined constants
    my %inlineconstants = $js=~m{/\*[#@]define ([A-Z_-]+) (.*?) \*/};
    $js = substitute_constants($js,%commandlineconstants);
    $js = substitute_constants($js,%inlineconstants);
    return $js;
}

sub substitute_constants {
    #defined constants
    my ($js,%constants) = @_;
    my @constants = keys %constants;
    my $reg = '/\*[#@]=('.join ('|',@constants).') \*/';
    $js=~s{$reg}{$constants{$1}}gmoe;
    return $js;
}

sub token {
    my $ret  = $_[3];
    my $func = $_[1].'_handler';
    no strict 'refs';
    eval {
        $ret = &$func(@_);
    };
    use strict;
    die "unknown keyword $_[1]. $@" if($@);
    return $ret;
}

sub ifdef_handler {
    my ($strippedcomment,$keyword,$var,$fullcomment)=@_;
    if($varLookup->{$var}) {
        return $strippedcomment;
    }
    return "";
}
sub ifndef_handler {
    my ($strippedcomment,$keyword,$var,$fullcomment)=@_;
    if($varLookup->{$var}) {
        return "";
    }
    return $strippedcomment;
}