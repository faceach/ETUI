#Reviewing CSS and static file

1. Coding style

    1. Properly line-break.
    
    2. Class, id should start with 'et-' to avoid conflict
    
    3. Use existing functional css class, such as et-clr.
    
    4. Symantically correct class name, for example, when element is activated,
    it should has class name such as et-active

2. iOS compatibilities
    
    1. Image size limitation:
    
        * JPEG 2 mega pixel
        
        * PNG/GIF 1024 * 1024 * 3
    
    2. 'Position: fixed' need to get fixed. (use webkit transform!)
    
    3. UI that combined by sprites will has gap between edges.

    4. Font-size generally has 2 pixel larger then the one on mac or pc.
    
3. IE6 compatibilities
    
    For IE6, below degradations is acceptable
    
    1. No alpha transparecy on background (when using png8)
    
    2. -TBD-
    
#JavaScript

1. Coding style:
    
    * General
    
        1. Every statement ends with a semicolon ';', be careful when assign a function to a variable,
        a semi colon is needed as well after the ending bracket '}', otherwise you may accidentally 
        execute the function:
        
            var func = function $_func(){
            
                blahblah
                
                blah
                
                ...
                
            }; <-- semicolon is important!
            
            // think if anyone wrote some code like this:
            
            var func = function $_func(){
            
                blahblah
                
                blah
                
                ...
                
            }
            
            
            (function($){
            
                $.blahblah
                
            })(jQuery);
            
            // what will happened when code was compressed?
        
        2. No global pollution, all variables go inside to a closure.
        
        
    
    * Comparing
    
        1. Use String.isNOE or String.isNOWS to check if a string is null or empty or whitespace,
        shall never use " if (String) {} "
        
            // detect if a string is empty or null is convinient when using 'if'
            // below code will never write '1' to console if str = null or str = ''
            
            str = ''
            if (str) { console.log(1); }
            
            // however, what about it is not a primitive string but a String Object?
            if (new String('')) { console.log(1);}
            
        2. Comparing if a variable is undefined should always reference to etui.undef rather than
        the original undefined.
            
            if (a === undefined ) { ... } // bad, people can over write undefined as it is not a keyword
            
            if (a === etui.undef ) { ... } // good, at least
            
            if (!etui.notdef(a)) { ... } // best
    
    * DOM
    
        1. All DOM operation should be executed after DOM Ready except &lt;html /&gt;.

2. Only functional CSS classes or HTMLs are allowed in JavaScript Code. Let's say:
    
    We are going to encapsulate the 'overlay' which display a masking alpha transparency
    layer on the top of page, this encapsulation should do the trick that displays the 
    marker and make sure it is covering the page no matter user 'scrolls', 'tabs' and 
    'clicks', so the logical that make sure marker is covering is essential and closely related
    to what people expect the overlay does, in this case, setting marker element's position
    to 'fixed' is one of the ways to implement and this is allowed in the code.
    
    For the other HTMLs that for decoration, the default value should be defined
    in constructor.opts.tmpl and all CSSs go to /css/ folder.

3. Correct dependencies, no circular references.
    -TBD- more detailed instruction

4. Function that is important to be loaded at the startup should not be placed under etui namespace,
    instead, they should under 'premier' namespace and should not depend on any function under etui 
    namespace (norm Jan26 2011: what about jQuery should we load it at startup?). so the script that 
    gets loaded in &lt;head /&gt; won't be too much and block the downloading thread of browser.
    
5. Cross-browser compatibilies

    1. iOS
        * use translateY to fix 'position: fixed'.
        
#Process

    _Content in this section may or may not applicable for pure front-end etui development, most of 
    them applys to Englishtown internal project check in process._

1. Every JavaScript commitment should contains a compressed version by using jsmin, the compressed 
    JavaScript file should be named in this format: [original name].min.js
    JSMin can be downloaded here: [[http://www.crockford.com/javascript/jsmin.html]]
    
    