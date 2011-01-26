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
	
	2. Position: fixed need to get fixed, (use webkit transform!)
	
	3. UI that combined by sprites will has gap between edges.
	
#JavaScript

1. Only functional CSS classes or HTMLs are allowed in JavaScript Code. For example:
	
	We are going to encapsulate the 'overlay' which display a masking alpha transparency
	layer on the top of page, this encapsulate should do the trick that display the marker
	and make sure it is covering the page no matter user 'scroll', 'tab' and 'click',
	so the logical that make sure marker is covering is essential and closely related
	to what people expect overlay does, in this case, setting marker element's position to
	'fixed' is one of the ways to implement and this is allowed in the code.
	
	For the other classes or HTMLS that for decoration, the default value should be defined
	in constructor.opts.tmpl
	
	
	