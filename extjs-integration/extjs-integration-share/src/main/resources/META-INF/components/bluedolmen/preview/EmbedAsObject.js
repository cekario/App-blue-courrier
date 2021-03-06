
Alfresco.WebPreview.prototype.Plugins.EmbedAsObject = function(wp, attributes) {
	
	this.wp = wp;
	this.attributes = YAHOO.lang.merge(Alfresco.util.deepCopy(this.attributes), attributes);
	
	return this;
	
};

Alfresco.WebPreview.prototype.Plugins.EmbedAsObject.prototype = {
		
	/**
	 * Attributes
	 */
	attributes : {

		/**
		 * Decides if the node's content or one of its thumbnails shall be
		 * displayed. Leave it as it is if the node's content shall be used. Set
		 * to a custom thumbnail definition name if the node's thumbnail contains
		 * the thumbnail to display.
		 * 
		 * @property src
		 * @type String
		 * @default null
		 */
		src : null,

		/**
		 * Comma separated string of Windows ActiveX id:s. Used in Internet
		 * Explorer only to test for plugin presence.
		 * 
		 * @property ieActiveX
		 * @type String
		 * @default "AcroPDF.PDF,PDF.PdfCtrl,FOXITREADEROCX.FoxitReaderOCXCtrl.1"
		 */
		ieActiveX : "AcroPDF.PDF,PDF.PdfCtrl,FOXITREADEROCX.FoxitReaderOCXCtrl.1",

		/**
		 * Test if a plugin is available. Use for mime types that need a plugin
		 * to display for example application/pdf.
		 * 
		 * @property testPluginAvailability
		 * @type String
		 * @default "false"
		 */
		testPluginAvailability : "false",
		
		previewHeight : "100%"
			
	},

	/**
	 * Tests if the plugin can be used in the users browser.
	 * 
	 * @method report
	 * @return {String} Returns nothing if the plugin may be used, otherwise
	 *         returns a message containing the reason it cant be used as a
	 *         string.
	 * @public
	 */
	report : function EmbedAsObject_report()
	{

		var 
			plugininstalled = false, 
			testPluginAvailability = this.attributes.testPluginAvailability && this.attributes.testPluginAvailability === "true"
		;

		if (testPluginAvailability === true) {

			// IE needs special way of testing for
			if (YAHOO.env.ua.ie > 0) {
				plugininstalled = this._detectPluginIE();
			} 
			else {
				if (Alfresco.util.isBrowserPluginInstalled(this.wp.options.mimeType)) {
					plugininstalled = true;
				}
			}

		} 
		else {
			plugininstalled = true;
		}

		// If neither is supported, then report this, and bail out as viewer
		if (plugininstalled === false && testPluginAvailability === true) {
			return this.wp.msg("label.browserReport", "Missing Plugin ");
		}
		
	},

	/**
	 * Display the node.
	 * 
	 * @method display
	 * @public
	 */
	display : function EmbedAsObject_display()
	{
		var 
			url = this.attributes.src ? this.wp.getThumbnailUrl(this.attributes.src) : this.wp.getContentUrl(), 
			displaysource = '', 
			previewHeight = this.attributes.previewHeight
		;

		displaysource += '<div class="embed-as-object">';
		displaysource +=   '<object name="EmbedAsObject" data="' + url + '" width="100%" height="' + previewHeight + '">';
		displaysource +=   '</object>';
		displaysource += '</div>';

		return displaysource;

	},

	/**
	 * Detect PDF plugin in IE
	 * 
	 * @method _detectPdfPluginIE
	 * @private
	 */
	_detectPluginIE : function EmbedAsObject_detectPluginIE()
	{

		if (!window.ActiveXObject) return false;
			
		var 
			control = null, 
			activeXIE = this.attributes.ieActiveX.split(','), 
			i = 0
		;

		// Loop the ActiveX id collection
		for ( i = 0, activeXIELength = activeXIE.length; i < activeXIELength; i++) {
			
			try {
				
				// Try to create instance
				control = new ActiveXObject(YAHOO.lang.trim(activeXIE[i]));
				if (control) return true;
				
			} catch (e) {
				// Do nothing
			}

		}
			
		return false;
		
	}
};