/*********************************************
 *	Tree config for SI-GDT information tool
 **********************************************/
window.Geoportal.DashBoard = {
		fichesPratiquesURL : 'http://192.168.1.86/jean/sigdt-config/services-ilwac/getFichePratique.php?',
		showlayerinfos : true,
		infosConfig : [{
			text        : 'NDVI',
			type		: 'ndvipanel',
			text_intro	: "<h1>NDVI data analysis</h1><p>NDVI data (vegetation indices) are produced on a decade " +
			"(10 days) regularity basis (1, 11 and 21th day each month).</p>" +
			"<p>With this tool, you can query historical NDVI data in several modes." +
			"Please choose one among the modes proposed on the left. </p>",
			annees		: ['1998', '1999', '2000', '2001','2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009','2010', '2011', '2012'],
			mois 		: [['01','janvier'],['02','février'],['03','mars'],['04','avril'],['05','mai'],['06','juin'],['07','juillet'],['08','août'],['09','septembre'],['10','octobre'],['11','novembre'],['12','décembre']],
			jours 		: ['01','11','21'],
			children	: [
			        	   {
			        		   text		: 'Annual data',
			        		   type		: 'ndvi_annual',
			        		   text_intro	: "Display the NDVI variation on an area over the last year (10-days intervals) : ",
			        		   text_body	: "",
			        		   /*chart		: {
	   		    		type		: "line",
	   		    		url			: 'http://192.168.1.86/jean/sigdt-config/services-ilwac/ilwac_json_queryNDVI.php?mode=year'
	   		    	}*/
			        		   chart		: {
			        			   type		: "column",
			        			   url			: 'http://192.168.1.86/geoportal-services/tsv_queryNDVI.php?data=NDVI&suffix=DV&mode=yearByMonths'
			        		   }
			        	   },
			        	   {
			        		   text		: "Yearly variations",
			        		   type		: 'ndvi_decade',
			        		   text_intro	: "Display the NDVI variation on an area over the past years : ",
			        		   text_body	: "",
			        		   chart		: {
			        			   type		: "column",
			        			   url			: 'http://192.168.1.86/geoportal-services/tsv_queryNDVI.php?data=NDVI&suffix=DV&mode=decade'
			        		   }
			        	   }
			        	   ] 
		},{
			text        : 'SoilMoisture',
			type		: 'ndvipanel',
			text_intro	: "<h1>Soil moisture analysis</h1><p>Soil moisture indices are produced on a decade " +
			"(10 days) regularity basis (1, 11 and 21th day each month).</p>" +
			"<p>With this tool, you can query historical Soil moisture data in several modes." +
			"Please choose one among the modes proposed on the left. </p>",
			annees		: ['1998', '1999', '2000', '2001','2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009','2010', '2011'],
			mois 		: [['01','janvier'],['02','février'],['03','mars'],['04','avril'],['05','mai'],['06','juin'],['07','juillet'],['08','août'],['09','septembre'],['10','octobre'],['11','novembre'],['12','décembre']],
			jours 		: ['01','11','21'],
			children	: [
			        	   {
			        		   text		: 'Annual data',
			        		   type		: 'ndvi_annual',
			        		   text_intro	: "Display the Soil moisture variation on an area over the last year (10-days intervals) : ",
			        		   text_body	: "",
			        		   /*chart		: {
	   		    		type		: "line",
	   		    		url			: 'http://192.168.1.86/jean/sigdt-config/services-ilwac/ilwac_json_queryNDVI.php?mode=year'
	   		    	}*/
			        		   chart		: {
			        			   type		: "column",
			        			   url			: 'http://192.168.1.86/geoportal-services/tsv_queryNDVI.php?data=SM&mode=yearByMonths'
			        		   }
			        	   },
			        	   {
			        		   text		: "Yearly variations",
			        		   type		: 'ndvi_decade',
			        		   text_intro	: "Display the Soil moisture variation on an area over the past years : ",
			        		   text_body	: "",
			        		   chart		: {
			        			   type		: "column",
			        			   url			: 'http://192.168.1.86/geoportal-services/tsv_queryNDVI.php?data=SM&mode=decade'
			        		   }
			        	   }
			        	   ] 
		},{
			text        : 'Surfaces Brûlées',
			type		: 'ndvipanel',
			text_intro	: "<h1>Surfaces Brûlées</h1><p></p>" +
			"<p>With this tool, you can query historical Vegetation Condition Index data in several modes." +
			"Please choose one among the modes proposed on the left. </p>",
			annees		: ['1998', '1999', '2000', '2001','2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009','2010', '2011'],
			mois 		: [['01','janvier'],['02','février'],['03','mars'],['04','avril'],['05','mai'],['06','juin'],['07','juillet'],['08','août'],['09','septembre'],['10','octobre'],['11','novembre'],['12','décembre']],
			jours 		: ['01','11','21'],
			children	: [
			        	   {
			        		   text		: 'Annual data',
			        		   type		: 'ndvi_annual',
			        		   text_intro	: "Display the Index variation on an area over the last year (10-days intervals) : ",
			        		   text_body	: "",
			        		   /*chart		: {
	   		    		type		: "line",
	   		    		url			: 'http://192.168.1.86/jean/sigdt-config/services-ilwac/ilwac_json_queryNDVI.php?mode=year'
	   		    	}*/
			        		   chart		: {
			        			   type		: "column",
			        			   url			: 'http://192.168.1.86/geoportal-services/tsv_queryNDVI.php?data=SB&mode=yearByMonths'
			        		   }
			        	   },
			        	   {
			        		   text		: "Yearly variations",
			        		   type		: 'ndvi_decade',
			        		   text_intro	: "Display the Index variation on an area over the past years : ",
			        		   text_body	: "",
			        		   chart		: {
			        			   type		: "column",
			        			   url			: 'http://192.168.1.86/geoportal-services/tsv_queryNDVI.php?data=SB&mode=decade'
			        		   }
			        	   }
			        	   ] 
		},{
			text : 'Pratiques GDT',
			type : 'pratiquesgdtpanel',
			text_intro : "<h1>Pratiques de Gestion Durable des Terres (GDT)</h1><p>La GDT est une des problématiques majeures au Mali. Un inventaire des pratiques recommandées, selon l'écosystème considéré a été réalisée.",
			zae_url : 'http://192.168.1.86/sigdt-config/services-ilwac/getZAE.php?',
			children : [
			            {
			            	text : 'Description',
			            	url : 'http://192.168.1.86/sigdt-config/services-ilwac/getPratiqueDescription.php?'
			            },
			            {
			            	text : 'Agriculture',
			            	url : 'http://192.168.1.86/sigdt-config/services-ilwac/getPratiqueAgriculture.php?'
			            },
			            {
			            	text : 'Dégradation',
			            	url : 'http://192.168.1.86/sigdt-config/services-ilwac/getPratiqueDegradation.php?'
			            },
			            {
			            	text : 'Pratiques',
			            	url : 'http://192.168.1.86/sigdt-config/services-ilwac/getPratiquePratiques.php?'
			            },
			            {
			            	text : 'Services rendus',
			            	url : 'http://192.168.1.86/sigdt-config/services-ilwac/getPratiqueServicesRendus.php?'
			            }
			            ]
		}]
}