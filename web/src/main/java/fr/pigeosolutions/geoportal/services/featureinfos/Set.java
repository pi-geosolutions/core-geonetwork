package fr.pigeosolutions.geoportal.services.featureinfos;

import java.io.StringReader;
import java.sql.SQLException;
import java.util.Arrays;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.resources.dbms.Dbms;
import jeeves.server.ServiceConfig;
import jeeves.server.UserSession;
import jeeves.server.context.ServiceContext;

import org.fao.geonet.constants.Geonet;
import org.jdom.Document;
import org.jdom.Element;
import org.xml.sax.InputSource;



//=============================================================================

/** Retrieves a particular user */

public class Set implements Service {
    /*private enum Mode { //necessary for the switch statement since String can be used in switch statements only since 1.7
        single, all;
    }
    private Mode mode = Mode.all;*/
    // --------------------------------------------------------------------------
    // ---
    // --- Init
    // ---
    // --------------------------------------------------------------------------

    public void init(String appPath, ServiceConfig params) throws Exception {
        /*String mode = params.getValue("mode");
        if (mode!=null) this.mode=Mode.valueOf(mode);*/
    }

    // --------------------------------------------------------------------------
    // ---
    // --- Service
    // ---
    // --------------------------------------------------------------------------

    public Element exec(Element params, ServiceContext context) throws Exception {
        Dbms dbms = (Dbms) context.getResourceManager().open(Geonet.Res.MAIN_DB);
        Element response = new Element(Jeeves.Elem.RESPONSE);
        
        java.util.List list = params.getChildren("layer");

        boolean success=true;
        
        dbms.execute("BEGIN;");
        dbms.execute("LOCK TABLE geoportal.\"fiLabels\" IN SHARE ROW EXCLUSIVE MODE;");
        System.out.println("BEGIN;");
        try  
        {  

            //System.out.println(root.getChildText("id")+"has "+list.size()+" children");
              for (int i = 0; i < list.size(); i++) {
                  Element node = (Element) list.get(i);
                  String name = node.getChildText("name");
                  String fields = node.getChildText("fields");
                  System.out.println("name: "+name+", fields (json): "+fields);
                  
                  //trick to perform an upsert. See http://www.the-art-of-web.com/sql/upsert/
                  String insertStmt = "INSERT INTO geoportal.\"fiLabels\" (layername, json) SELECT '"+name+"', '"+fields+"'";
                  String updateStmt = "UPDATE geoportal.\"fiLabels\" SET json='"+fields+"' WHERE layername='"+name+"'";
                  String upsertStmt = "WITH upsert AS ("+updateStmt+" RETURNING *) "+insertStmt+" WHERE NOT EXISTS (SELECT * FROM upsert)";

                  System.out.println("SQL statement (performs an 'UPSERT'): ");
                  System.out.println(upsertStmt);
                  dbms.execute(upsertStmt);
              }
        } catch (SQLException e) {  
            e.printStackTrace();  
            success=false;
        } 
        if (success) {
            dbms.execute("COMMIT;");
            System.out.println("COMMIT;");
            System.out.println("done;");
        } else {
            dbms.execute("ROLLBACK;");
            System.out.println("ROLLBACK;");
        }
        // --- return data
        return response;
    }

}