package fr.pigeosolutions.geoportal.services.layers;

import java.sql.SQLException;

import org.jdom.Element;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.resources.dbms.Dbms;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;
import jeeves.utils.Util;

/** Retrieves a particular user */

public class GetChartData implements Service {
    
    // --------------------------------------------------------------------------
    // ---
    // --- Init
    // ---
    // --------------------------------------------------------------------------

    public void init(String appPath, ServiceConfig params) throws Exception {
    }

    // --------------------------------------------------------------------------
    // ---
    // --- Service
    // ---
    // --------------------------------------------------------------------------

    public Element exec(Element params, ServiceContext context) throws Exception {
        Dbms dbms=null;

        Element resp = new Element(Jeeves.Elem.RESPONSE);
        Element list = new Element("list");
        
        
        String db = Util.getParam(params, "source",null);
        String tableslist = Util.getParam(params, "tables",null);
        String fields = Util.getParam(params, "fields",null);
        String where = Util.getParam(params, "where",null);
        
        if (db==null || tableslist==null || fields==null )
            return new Element(Jeeves.Elem.RESPONSE);
        
        dbms = (Dbms) context.getResourceManager().open(db);
        if (dbms==null) 
            return new Element(Jeeves.Elem.RESPONSE);
        
        String[] tables = tableslist.split(",");
        
        for (int i=0 ; i < tables.length ; i++) {
            Element table = new Element("table");
            table.addContent(new Element("id").setText(Integer.toString(i)));
            table.addContent(new Element("name").setText(tables[i]));
            Element features = this.getFeatures(dbms, tables[i], fields, where);
            table.addContent(features);
            list.addContent(table);
        }
        
        resp.addContent(list);
        return resp;
    } 

    private Element getFeatures(Dbms dbms, String table, String fields, String where) throws SQLException {
        String req = "SELECT "+this.quoteFields(fields)+" FROM "+this.quoteTable(table)+" ";
        if (where!="") {
            req += "WHERE " +where;
        }
        req+=";";
        System.out.println(req);
        Element features = dbms.select(req);
        /*
        Element features = dbms.select("SELECT ?, ST_X(ST_Transform(ST_Centroid(?),4326)) AS lon, "
                + "ST_Y(ST_Transform(ST_Centroid(?),4326)) AS lat, "
                + "ST_AsGeojson(ST_Transform(ST_Centroid(?),4326)) AS the_geom FROM ?; ", this.quote(fields), geom_field, geom_field, geom_field, table);
        */
        features.setName("features"); 
        return features;
    }

    private String quoteFields(String fields) {
        String fieldslist="";
        String[] tb = fields.split(",");
        for (int i=0 ; i  < tb.length ; i++) {
            fieldslist += "\""+tb[i]+"\",";
        }
        fieldslist = fieldslist.substring(0, fieldslist.length() -1); //trim last comma
        
        return fieldslist;
    }
    
    private String quoteTable(String tbname) {
        String quotedName="\""+tbname+"\"";
        //in case we use schemas names (schema distinct from public), we must split the schema name and the table name, and quote each
        quotedName = quotedName.replace(".", "\".\"");
        return quotedName;
    }
}