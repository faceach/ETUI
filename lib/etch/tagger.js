/*!require: etch */
/**
 * @singleton etch.tagger
 * Tagger adds useful tags such as browser name, version, country, 
 * language info, html5-support as class name to the root element so
 * we can styling the page with css accordingly. 
 * 
 * @usage
 * etch.tagger.tag(); // basic tagging
 * // or 
 * etch.tagger.tag({more: true}); // will add more etown specific info
 * 
 */
!function($){
	// ************
	// * Variables
	// ************
	var defaultSettings = {
		more: false
	};
	// tagging logical should be ran at most once 
	var isRan = false;
	var KEY_COUNTRY = 'ctr';
	var KEY_LANG = 'lng';
	var KEY_DEBUG = 'debug';
	var KEY_PARTNER = 'p';
	var knownBrowsers = ['msie', 'webkit', 'mozilla', 'opera'];
	var knownOSs = {
		'mac':{},
		'win':{}, 
		'linux':{}, 
		'iphone':{css:'ios iphone'},
		'ipad':{css:'ios ipad'}
	};
	var knownAsianLngs = ['ko', 'ja', 'ch', 'cs' ];
    var knownHtml5Browser = ['msie9', 'mozilla', 'opera', 'webkit'];
    var knownRightToLeft = ['az', 'ar'];
    // containing info that specific to etown
    var etInfo = null;
	
	// ************
	// * Private Functions
	// ************
	
	/**
	 * @function compareKey Compare 2 strings and avoid case sensitive
	 * @private
	 */
	function compareKey(key1, key2){
		if (!key1) return false;
		return key1.trim().toUpperCase() == key2.toUpperCase();
	};
	
	/**
	 * @function getCookieInfo Get country, language, partner info from
	 * cookie
	 * @private
	 */
	function getCookieInfo(){
		// it is meaningless to run this code multiple times
		if (etInfo) return etInfo;
		
		var ret = {};
		var cPair = document.cookie.toString().split(';');
		for(var i in cPair){
			
			var kv = cPair[i].split('=');
			
			if (kv.length <= 0) continue;
			
			var key = kv[0].trim();
			if (compareKey(key, KEY_COUNTRY)){
				kv.splice(0,1);
				ret[KEY_COUNTRY] = kv.join('=');
			}
			else if (compareKey(key, KEY_LANG)){
				kv.splice(0,1);
				ret[KEY_LANG] = kv.join('=');
			}
			else if (compareKey(key, KEY_DEBUG)){
				// looking into for debug section
				kv.splice(0,1);
				var value = kv.join('=');
				var debugs = value.split('|');
				for(var i = debugs.length; i--;){
					if (debugs[i].indexOf(':') < 0) continue;
					var debugkv = debugs[i].split(':');
					
					// if it is key value pair
					if (debugkv.length > 1){
						if (compareKey(debugkv[0], KEY_PARTNER)){
							debugkv.splice(0, 1);
							ret[KEY_PARTNER] = debugkv.join(':');
						}
					}
				}
			}
		}
		
		etInfo = ret;
		return ret;
		
	};
	
	/**
	 * @function isAsianLng Check if lng code is known asia language
	 * @private
	 */
	function isAsianLng(lng){
		for(var l = knownAsianLngs.length; l--;){
			if (knownAsianLngs[l] == lng)
				return true;
		}
		
		return false;
	}
	
	// ************
	// * Tagging Functions
	// ************
	var taggers = {
		/**
		 * @function browserBasic Add basic browser info such as browser
		 * name or version
		 */
		browserBasic: function(){
			var binfo = this.binfo,
				browser = this.browser,
				s = this.opts;
			
			var l;
			
			// add basic browser name
			this.set(browser);
			
			// add non-[browser name] class name
			for(l = knownBrowsers.length; l--;){
				if (browser != knownBrowsers[l]){
					this.set('non-' + knownBrowsers[l]);
				}
			}
			
			// special class name for non ie 6 and 7
			if (browser != 'msie' && 
				binfo.version != 6 && binfo.version != 7){
					this.set('non-msie6-msie7'); 
			}
            
			// class is used for css styling not js handling, so lets 
			// use documentMode rather then version.
			if (binfo.browser == 'msie' && document.documentMode) {
				binfo.version = document.documentMode + '';
			}
			
			var major = Math.floor(binfo.version);
			// get major when there is a dot
			if (binfo.version.indexOf('.') >= 0){
				major = Math.floor(
					binfo.version.substring(0, 
						binfo.version.indexOf('.')));
			}
            
			this.set(browser + major);
            
            
		},
		/**
		 * @function browserHtml5 Check if current browser support html5
		 */
		browserHtml5: function(){
			var binfo = this.binfo,
				browser = this.browser,
				s = this.opts;
			
			var l,
				major = Math.floor(binfo.version);
			
			// html5 browser tag
            var html5TagSet = false;
            for(l = knownHtml5Browser.length; l--;){
                if (knownHtml5Browser[l] == browser || 
                    knownHtml5Browser[l] == browser + major){
                    this.set('html5browser');
                    html5TagSet = true;
                    break;
                }
            }
            
            if (!html5TagSet){
                this.set('non-html5browser');
            }
            
            // TODO: detailed html5 feature detect
		},
		/**
		 * @function platform Check current platform info
		 */
		platformBasic: function(){
			var binfo = this.binfo,
				browser = this.browser,
				s = this.opts;
			
			var name;
			
			// get OS info
			// Figure out what OS is being used 
			for(name in knownOSs){
				if (!knownOSs.hasOwnProperty(name)){ continue; }
				var oskeyword = name;
				var osinfo = knownOSs[name];
				var cssname = osinfo.css ? osinfo.css: name;
				var re = new RegExp(oskeyword, "i");
				if (re.test(navigator.userAgent)){
					this.set(cssname);
				}
			}
			
			// TODO: orientation detection
		}
	};
	
	var etTaggers = {
		/**
		 * @function etownBasic Get etown specified basic info such as 
		 * country code and language name
		 */
		etownBasic: function(){
			// add country info and language info to root element
			var etInfo = getCookieInfo();
			
			this.set('et_ctr_' + etInfo.ctr);
			this.set('et_lng_' + etInfo.lng);
		},
		/**
		 * @function language Get additional language info
		 */
		languageAdditional: function(){
			var etInfo = getCookieInfo();
			
			if (isAsianLng(etInfo.lng)){
				this.set('et_lng_asian');
			}
			else{
				this.set('et_lng_non_asian');
			}
		}
	};

	// ************
	// * The singleton and public functions
	// ************
	etch.tagger = {
		/**
		 * @function set Set tag (add class name to root element)
		 * @public
		 */
		set: function(className){
			var l, classes;
			
			this.target.addClass(className);
			
			classes = className.split(' ');
			
			for(l = classes.length; l--;){
				this.tags[classes[l]] = true;
			}
		},
		/**
		 * @function tag Start the tagging logical
		 * @public
		 * @option more Run etown specific tagging logic
		 */
		tag: function(options){
			if (isRan) return;
			
			// ************
			// * local variables
			
			// options
			this.opts = $.extend(s, defaultSettings, options);
			
			// the root element for being tagged
			this.target = $(document.documentElement);
			
			// contains all tags added
			this.tags = {};
			
			// get ua info
			this.binfo = $.uaMatch(navigator.userAgent);
			this.browser = this.binfo.browser;
			
			var keyname;
			
			// run basic tagger
			for (keyname in taggers){
				if (!taggers.hasOwnProperty(keyname)) { continue; }
				
				taggers[keyname].call(this);
			}
			
			// run etown specific tagger
			if (s.more){
				
				for (keyname in etTaggers){
					if (!taggers.hasOwnProperty(keyname)) { continue; }
					
					taggers[keyname].call(this);
				}
			}
			
			// prevent future run.
			isRan = true;
		}
	};
}(jQuery);
