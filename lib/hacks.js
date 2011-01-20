/*
Below are extension methods for native types in JavaScript.
*/
(function () {
    /**
    * Replaces asp.net style placeholder (<%=sample %>) with specified value
	* @member String
    * @param {String} macro Specify the name of the macro
    * @param {String} value The value to be replaced.
    */
    String.prototype.macro || (String.prototype.macro = function (macro, value) {
        var re = new RegExp("<%=" + macro + " %>", "g");
        return this.replace(re, value);
    });

	/**
    * Trim specified chars at the start and the end of current string.
	* @member String
    * @param {String} aChar Specify the char to be trimmed other than blank spaces
    */
	Method: String.prototype.trim
	
	Trim specified chars at the start and the end of current string.
	*/
	String.prototype.trim || (String.prototype.trim = function(aChar) {
		if (aChar == null)
			aChar = '\\s';
		var re = new RegExp('(^' + aChar + '*)|(' + aChar + '*$)', 'g');
		return this.replace(re, "");
	});
	
	/**
    * Return true if current string is null or empty
	* @member String
    * @param {String} str Specify the string to be checked.
    */
	String.isNOE || (String.isNOE = function(str) {
		if (str == null || str == '')
			return true;
		return false;
	});
		
	/**
    * Binds function execution context to specified obj, locks its execution scope to an object.
	* @member Function
    * @param {Object} Context - The context to be bond to.
	* @return Return a new function that its execution context is bond.
    */
    Function.prototype.bind || (Function.prototype.bind = function (context) {
        var __method = this;
        return function () {
            return __method.apply(context, arguments);
        }
    });
	
	/**
    * Return a string that with commas seperated every 3 numbers.
	* @member Number
	* @return a string that represent the number and seperated with commas every 3 chars.
    */
	Number.prototype.toCurrency || (Number.prototype.toCurrency = function(){
		var formated = this.toFixed(2);
		var floatIndex = formated.indexOf('.');
		var chars = formated.split('');

		for(var i = 0; i < chars.length; i++){
			if (i >= floatIndex - 1){
				break;
			}

			if ((floatIndex - 1 - i) % 3 == 0)
				chars[i] = chars[i] + ',';
		}

		formated = chars.join('');
		return formated;
	});

})();