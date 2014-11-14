/*
 * Copyright (C) 2009 GeoNetwork
 *
 * This file is part of GeoNetwork
 *
 * GeoNetwork is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * GeoNetwork is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GeoNetwork.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.namespace('GeoNetwork', 'GeoNetwork.jpLang');

GeoNetwork.jpLang.en = {
	//fixes
    'org': "Organization",
    //new ones
	'choose': 'Select',
	'facetsTitle':'Narrow your Search',
	'form': 'Search form',
	'geogCriteria': 'Geographic criteria',
    'gxBaseLayerContainer':"Base Layer",
    'PigeoGeoserver':'pi-Geosolutions\' map server',
	'legend:': 'Legend:',
    'organize': 'Organize',
    'geocatalogue':'Geo-catalogue',
    'overlay:':'Overlay: ',
    'ovGoogleHybrid':"Google Hybrid background map",
	'print': 'Print',
	'printHeader':"Please note that this isn't truly a print page but a PDF page generator. This PDF you can then print or save on your computer. "+
		'<br /><br /><b>Warning:</b> Google and Bing-based backgrounds will not show in the printed view. This is due to Google/Bing licence restrictions. So, take care to put some data in the background for printing, or you could get something like a white, squared area...',
	'results': 'Search results',
	'showLegend': 'Display the legend',
	'horizCurtainButtonText': 'Horizontal curtain',
	'vertCurtainButtonText': 'Vertical curtain',
	'apply': 'Apply',
	'day':'Day',
	'month':'Month',
	'year':'Year',
	'dashBoardTooltipTitle':'Temporal Profiles',
	'dashBoardTooltipText':"Click somewhere on the map to display the Temporal Profiles tool. It will give you tools to analyze several factors upon time",
	"dash_DashBoardWindow.windowTitle" : "Temporal Profiles",
	'dash_ChooseDecade':'Choose which decade to query',
	'dash_ChooseYear':'Choose the year to display',
	'anim_AnimationsWindow.windowTitle': 'Animations',
	'anim_btn_first':'First image',
	'anim_btn_previous' : 'previous image',
	'anim_btn_pause':'stop loops',
	'anim_btn_loopforward':'loop forward',
	'anim_btn_loopbackward':'loop backward',
	'anim_btn_next':'next image',
	'anim_btn_last' :'last image',
	'anim_ready':"100%, ready to play!",
	'linkedMtdWarnTitle' : 'Warning',
	'linkedMtdWarnText' : 'You will loose the changes made since last save. If you have made significant changes, you may want to save the metadata contents first (\'Save\' button). <br /> Do you want to proceed anyway ?',
	'tools':'Locate',
	'shortcuts':'Shortcuts',
	'pratiquesGDT':'<h1 class="soberH1">Map the Sustainable Land Management (SLM) practices</h1>',
	'pratiquesConfTitle':'<h1 class="soberH1">Map of best SLM practices</h1>',
	'shortcutsAdminTitle': '<h1 class="soberH1">Administrative entities</h1>',
	'shortcutsZaeTitle': '<h1 class="soberH1">Agro-ecologic areas</h1>',
	'geonamesSearchPanelTitle' : 'Chercher un lieu (base Geonames)',
	'geonamesCbHeader': '<h1 class="soberH1">Search for a place (Geonames database)</h1>This tool perfoms a search in the geonames database (geonames.org). <br />Enter the first letters of the name of the place, and if it does exist in the database, the corresponding results will be listed. When you hover a result, its position is pointed on the map.',
	'geonamesLoadingText': 'Query the Geonames database...',
	'geonamesEmptyText': 'Search for a place (Geonames)',
	'SLMtools' : 'SLM Best Pratices',
	'searchTools' : 'Search tools (places)',
	'openPratiqueSheet' : 'Open sheet',
	'legend': 'Legend',
	'openLegendButtonText':'Open legend in popup',
	'featureInfoTitle':'Selected features:',
	'fi_manageFields':'Manage fields',
	"featureInfoManager.windowTitle":'Fields Manager',
	"featureInfoManager.langGrid.code":'Code',
	"featureInfoManager.langGrid.name":'Name',
	"featureInfoManager.langGrid.title":'Select active language',
	'featureInfoManager.fieldsGrid.title':'Fields list',
	'featureInfoManager.fieldsGrid.save':'Save for this layer only',
	'featureInfoManager.fieldsGrid.saveall':'Save all changes',
	
	'hasMtd':"Metadata available in the catalog. To see them, right-click on the layer and choose 'Metadata'",
	'isQueryable': 'You can perform queries on this layer',
	'isPQueryable': 'You can use the Polygon Query tool on this layer',
	'polygonQueryWindow.windowTitle':'Polygon Query',
	'polygonQueryWindow.header.text':'<h3>Presentation</h3> <p>The <i>Polygon Query</i> tool is currently active. You can draw on the map the polygon on which you want to collect information'+
		'<br />When done, the panel below will update accordingly with the newly collected information. The information available in the panel below matches with the polygon drawn with red stroke on the map and the layer mentioned in this panel.'+
		'<br />To quit the <i>Polygon Query</i> mode, simply select another tool on the map\'s toolbar. Default tool is the pan tool (<i>hand</i> icon)</p>',
	'polygonQueryWindow.target' :"Target Layer: ",
	'polygonQueryWindow.resText.empty':'No result yet.',
	'polygonQuery.count': 'Nb of pixels covered',
	'polygonQuery.min': 'Min',
	'polygonQuery.max': 'Max',
	'polygonQuery.avg': 'Average',
	'polygonQuery.sum': 'Sum',
	'polygonQuery.stddev': 'Standard dev.',
	'polygonQuery.resultsHeader': 'Collected Statistics: ',
	'polygonQuery.loading':'Loading...',
	'polygonQuery.queryFailure':'Error trying to retrieve the stats. You may be experiencing network failures. If this error '+
		'persists, please contact the portal\'s administrator',
	'zz':'zz'
};
OpenLayers.Util.extend(OpenLayers.Lang.en, GeoNetwork.jpLang.en);
