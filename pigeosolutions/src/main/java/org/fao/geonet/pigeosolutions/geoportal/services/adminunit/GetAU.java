package org.fao.geonet.pigeosolutions.geoportal.services.adminunit;

import net.sf.json.JSON;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.dbcp.BasicDataSource;
import org.fao.geonet.ApplicationContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

/**
 * Created by fgravin on 21/11/2015.
 */

@Controller
public class GetAU {

    @Autowired
    JdbcTemplate jdbcTemplate;

    private BasicDataSource dataSource;
    @Resource(name="pigeo_geodata")
    public void setBean( BasicDataSource bean ) {
        dataSource = bean;
    }

    @RequestMapping(value="/{lang}/pigeo.adminunit/{type}/", produces= MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public JSONArray getAll(@PathVariable String lang, @PathVariable String type) throws SQLException {

        String sql = "select * from \"v_" + type + "bounds\"";

        jdbcTemplate = new JdbcTemplate(dataSource);

        JSONArray data = new JSONArray();
        List<JSONObject> entries = jdbcTemplate.query(sql, new DataRowMapper());
        for(JSONObject entry : entries) {
            data.add(entry);
        }
        return data;
    }
/*
        try {
            stmt = con.createStatement();
            rs = stmt.executeQuery(sql);
            ResultSetMetaData rsmd = rs.getMetaData();

            while (rs.next()) {
                JSONObject o = new JSONObject();
                for (int i = 1; i <= rsmd.getColumnCount(); i++) {
                    o.put(rsmd.getColumnName(i), rs.getString(i));
                }
                ret.add(o);
            }
        } catch (SQLException e) {
            throw e;
        } finally {
            if (stmt != null) stmt.close();
            if (rs != null) rs.close();
        }
*/



    @RequestMapping(value="/{lang}/pigeo.adminunit/{type}/{id}", produces= MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getUnit(
            @PathVariable String type,
            @PathVariable String id
    ) throws SQLException {

        String sql = "select ST_AsGeoJSON(the_geom) AS geojson from \"v_" + type + "bounds\" where id=" + id;

        jdbcTemplate = new JdbcTemplate(dataSource);

        return jdbcTemplate.queryForObject(sql, String.class);
    }

}
