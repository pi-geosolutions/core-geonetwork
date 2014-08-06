<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
							  xmlns:fo="http://www.w3.org/1999/XSL/Format">

	<xsl:include href="../../header.xsl"/>
	<xsl:include href="../../banner.xsl"/>

	<xsl:variable name="widgetPath">../../apps</xsl:variable>
	<xsl:variable name="indent" select="100"/>

	<xsl:template mode="css" match="/" priority="2">
		<link rel="stylesheet" type="text/css" href="{$widgetPath}/js/ext/resources/css/ext-all.css"/>
		<link rel="stylesheet" type="text/css" href="{$widgetPath}/js/ext-ux/FileUploadField/file-upload.css"/>
		<link rel="stylesheet" type="text/css" href="{$widgetPath}/js/ext-ux/MultiselectItemSelector-3.0/Multiselect.css"/>
		<link rel="stylesheet" type="text/css" href="{$widgetPath}/css/gnmapdefault.css"/>
		<link rel="stylesheet" type="text/css" href="{$widgetPath}/css/gnmetadatadefault.css"/>
		<link rel="stylesheet" type="text/css" href="{$widgetPath}/css/metadata-view.css"/>
		<link rel="stylesheet" type="text/css" href="{$widgetPath}/geoportal/css/admin.css"/>
		<link rel="stylesheet" type="text/css" href="{$widgetPath}/geoportal/css/gnjp.css"/>
	</xsl:template>

	<xsl:template mode="script" match="/" priority="2">
		<script type="text/javascript" src="{$widgetPath}/js/ext/adapter/ext/ext-base.js"/>
		<script type="text/javascript" src="{$widgetPath}/js/ext/ext-all-debug.js"/>
		<script type="text/javascript" src="{$widgetPath}/js/proj4js-compressed.js"/>

		 <xsl:choose>
			<xsl:when test="/root/request/debug">
				<script type="text/javascript" src="{$widgetPath}/js/ext-ux/Rating/RatingItem.js"/>
				<script type="text/javascript" src="{$widgetPath}/js/ext-ux/FileUploadField/FileUploadField.js"/>
				<script type="text/javascript" src="{$widgetPath}/js/ext-ux/TwinTriggerComboBox/TwinTriggerComboBox.js"/>
				<script type="text/javascript" src="{$widgetPath}/js/ext-ux/DateTime/DateTime.js"/>
				<script type="text/javascript" src="{$widgetPath}/js/ext-ux/RowExpander/RowExpander.js"/>
				<script type="text/javascript" src="{$widgetPath}/js/ext-ux/MultiselectItemSelector-3.0/DDView.js"/>
				<script type="text/javascript" src="{$widgetPath}/js/ext-ux/MultiselectItemSelector-3.0/Multiselect.js"/>
				<script type="text/javascript" src="{$widgetPath}/js/ext-ux/SuperBoxSelect/SuperBoxSelect.js"/>
				<script type="text/javascript" src="{$widgetPath}/js/ext-ux/LightBox/lightbox.js"/>

				<script type="text/javascript" src="{$widgetPath}/js/OpenLayers/lib/OpenLayers.js"/>
				<script type="text/javascript" src="{$widgetPath}/js/GeoExt/script/GeoExt.js"/>
				<script type="text/javascript" src="{$widgetPath}/js/GeoNetwork/lib/GeoNetwork.js"/>
			</xsl:when>
			<xsl:otherwise>
				<script type="text/javascript" src="{$widgetPath}/js/GeoNetwork-mini.js"/>
			</xsl:otherwise>
		</xsl:choose>
		
    	<script type="text/javascript" src="{$widgetPath}/geoportal/js/lang/fr.js"></script>
    	<script type="text/javascript" src="{$widgetPath}/geoportal/js/lang/en.js"></script>
    	<script type="text/javascript" src="{$widgetPath}/jean/GeoNetwork/layers/GeoportalAbstractLayer.js"></script>
    	<script type="text/javascript" src="{$widgetPath}/jean/GeoNetwork/layers/GeoportalFolderLayer.js"></script>
    	<script type="text/javascript" src="{$widgetPath}/jean/GeoNetwork/layers/GeoportalWMSLayer.js"></script>
    	<script type="text/javascript" src="{$widgetPath}/jean/GeoNetwork/layers/GeoportalChartLayer.js"></script>
    	<script type="text/javascript" src="{$widgetPath}/jean/GeoNetwork/admin/Utils.js"></script>
    	<script type="text/javascript" src="{$widgetPath}/jean/GeoNetwork/admin/LayertreeIO.js"></script>
    	<script type="text/javascript" src="{$widgetPath}/jean/GeoNetwork/admin/LayerForm.js"></script>
    	<script type="text/javascript" src="{$widgetPath}/jean/GeoNetwork/admin/BackupGridManager.js"></script>
    	<script type="text/javascript" src="{$widgetPath}/jean/GeoNetwork/admin/GeoportalTreeLoader.js"></script>
    	<script type="text/javascript" src="{$widgetPath}/jean/GeoNetwork/admin/LayertreeManagerPanel.js"></script>
    	
    	
    	
    	
		<!-- TODO : Here we load "search" app configuration. It may be another app which is used 
			as default. This should be improved when moving admin to widgets. 
		<script type="text/javascript" src="{$widgetPath}/search/js/map/Settings.js"/>-->
		

		<script type="text/javascript" language="JavaScript">
			var catalogue;
			OpenLayers.ImgPath = '<xsl:value-of select="$widgetPath"/>/js/OpenLayers/img/';

			Ext.onReady(function(){
				Ext.QuickTips.init();

				GeoNetwork.Util.setLang('<xsl:value-of select="/root/gui/language"/>', '<xsl:value-of select="$widgetPath"/>');

				catalogue = new GeoNetwork.Catalogue({
					statusBarId : 'info',
					hostUrl: '../..',
					lang: '<xsl:value-of select="/root/gui/language"/>',
					mdOverlayedCmpId : 'resultsPanel'
				});

				var manager = new GeoNetwork.admin.LayertreeManagerPanel({
					renderTo		: 	'manager',
					catalogue		: 	catalogue,
					autoWidth 		: 	true,
					serviceBaseUrl 	: 	'<xsl:value-of select="/root/gui/locService"/>',
					height			: 	680
				});
			})
		</script>
	</xsl:template>

	<xsl:template match="/">
		<html>
			<head>
				<xsl:call-template name="header"/>
				<xsl:apply-templates mode="script" select="/"/>

				<style type="text/css">
					body {
						height:100%;
					}
				</style>
			</head>
			<body>
				<xsl:call-template name="banner"/>
				<div id="content_container">
					<xsl:call-template name="content"/>
				</div>
			</body>
		</html>
	</xsl:template>

	<xsl:template name="content">

		<table  width="100%" height="100%">
<!--  		<tr>
				<td class="padded-content" width="{$indent}"/>
				<td class="dots"/>
				<td class="padded-content" style="height:25px;">
					<h1><xsl:value-of select="'Manage layertree'"/></h1>
				</td>
			</tr>
-->				<tr>
				<td class="padded-content" width="{$indent}"/>
				<td class="dots"/>
				<td >
					<div id="manager" style="width:100%;" align="left"/>
				</td>
			</tr>
			<tr>
				<td class="padded-content" width="{$indent}" style="height:25px;"/>
				<td class="dots"/>
				<td class="padded-content" style="text-align:center;">
					<button class="content" onclick="load('{/root/gui/locService}/admin')">
						<xsl:value-of select="/root/gui/strings/back"/>
					</button>
				</td>
			</tr>
			<tr><td class="blue-content" colspan="3"/></tr>
		</table> 
	</xsl:template>

</xsl:stylesheet>
