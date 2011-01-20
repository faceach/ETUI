/*!require:*/
/**
* Below are extension methods for native types in JavaScript.
* this module should not depend on any other module
* @fileoverview
* @author EnglishTown Lab
* @license BSD
*/
(function () {
    /**
    * Hacks for native String constructor
    * 
    * @class String
    */
    
    /**
    * Replaces asp dot net style placeholder (<%=sample %>) with specified value
    *
    * @member String
    * @return {String} A new string which its content was replaced.
    * @param {String} macro Specify the name of the macro
    * @param {String} value The value to be replaced.
    */
    String.prototype.macro || (String.prototype.macro = function (macro, value) {
        var re = new RegExp("<%=" + macro + " %>", "g");
        return this.replace(re, value);
    });

    /**
    * Trim specified chars at the start and the end of current string.
    * 
    * @member String
    * @return {String} Trimmed string.
    * @param {String} aChar Specify the char to be trimmed other than blank spaces
    */
    String.prototype.trim || (String.prototype.trim = function(aChar) {
        if (aChar == null)
            aChar = '\\s';
        var re = new RegExp('(^' + aChar + '*)|(' + aChar + '*$)', 'g');
        return this.replace(re, "");
    });
    
    /**
    * Hacks for native Function constructor
    * 
    * @class Function
    */
    
    /**
    * Binds function execution context to specified object, locks its execution scope to an object.
    *
    * @member Function
    * @return {Function} Return a new function that its execution context is bond.
    * @param {Object} Context The context to be bond to.
    */
    Function.prototype.bind || (Function.prototype.bind = function (context) {
        var __method = this;
        return function () {
            return __method.apply(context, arguments);
        }
    });
    
    /**
    * Hacks for native Number constructor
    * 
    * @class Number
    */
    
    /**
    * Return a string that with commas seperated every 3 char.
    *
    * @member Number
    * @return {String} a string that represent the number and seperated with commas every 3 chars.
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