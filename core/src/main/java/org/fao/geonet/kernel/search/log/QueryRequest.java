/*
 * Copyright (C) 2001-2016 Food and Agriculture Organization of the
 * United Nations (FAO-UN), United Nations World Food Programme (WFP)
 * and United Nations Environment Programme (UNEP)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
 * Rome - Italy. email: geonetwork@osgeo.org
 */

package org.fao.geonet.kernel.search.log;

import jeeves.server.context.ServiceContext;
import org.fao.geonet.utils.Log;
import org.fao.geonet.constants.Geonet;
import org.fao.geonet.domain.ISODate;
import org.fao.geonet.domain.statistic.LuceneQueryParamType;
import org.fao.geonet.domain.statistic.SearchRequest;
import org.fao.geonet.domain.statistic.SearchRequestParam;
import org.fao.geonet.repository.statistic.SearchRequestParamRepository;
import org.fao.geonet.repository.statistic.SearchRequestRepository;
import org.springframework.util.Assert;

import javax.annotation.Nonnull;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * A bean representing a query request.
 * Performs the mapping with the database.
 * @author nicolas
 *
 */
public class QueryRequest {
	/** the date format when inserting date into database */
	public static final String DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
	
	/** the constant for service MD query type */
	//todo: moves these 3 constants into a config file to avoid hard-coded values for queryType 
	public static final String QUERY_TYPE_MDS = "service";
	
	/** the constant for service MD query type */
	public static final String QUERY_TYPE_MDD = "dataset";

	/** the constant for geodata query type */
	public static final String QUERY_TYPE_GEO = "basicgeodata";

	/** the constant for geodata query type */
	public static final String QUERY_TYPE_ALL = "all";

	/** The db unique identifier for the stored request */
	int requestId;
	/** the QueryInfo objects generated during this query: search terms and search fields */
	private List<SearchRequestParam> queryInfos;
	
	/** The date of the Query */
	private Date date;
	
	/** the formatted date to insert into database (varchar field...) */
	private String formattedDate;
	
	/** The client IP making the search query */
	private String ip;
	
	/** the lucene query */
	private String luceneQuery;
	
	/** the number of hits for this query */
	private Integer hits;
	
	/** the query language */
	private String language;
	
	/** the query sort by clause */
	private String sortBy;
	
	/** the query spatial filter
	 * todo: store a true geotools spatialFilter ? 
	 */
	private String spatialFilter;
	
	/** the metadata searched type. see static constants for the list of types. */
	private LuceneQueryParamType mdType;
	
	/** the service use to do the search */
	private String service;
	
	/** true if this query is simple (concerned only the what, type, canton fields), false otherwise
	 * 
	 */
	private boolean simpleQuery; 
	
	/** true if the query was autogenerated eg from a guiservice, false otherwise */
	private boolean autoGenQuery;
	
	/**
	 * ctor taking the client ip and query date
	 * todo: should remove dependency from jeeves services ?
	 */
	public QueryRequest(String ip, long queryDate) {
		this.ip = ip;
		// taking object creation date...
		this.date = new Date(queryDate);
		this.formattedDate = new SimpleDateFormat(QueryRequest.DATE_FORMAT).format(this.date);
		//all queries default to ALL mdType, except if overloaded by a queryInfo object
		this.mdType = LuceneQueryParamType.MATCH_ALL_DOCS;
	}

	/**
	 * sets the queryinfo object and also look into all queryInfos to see if a query type can be guessed
	 * @param queryInfos
	 */
    public void setQueryInfos(@Nonnull List<SearchRequestParam> queryInfos) {
        Assert.isTrue(queryInfos != null);
        this.queryInfos = queryInfos;
        for (SearchRequestParam qi : queryInfos) {
            Assert.isTrue(qi != null);
            LuceneQueryParamType t = qi.getQueryType();
            if (t != null) {
                this.mdType = t;
                // type is unique into a Lucene query ?
                break;
            }
        }
    }

    public Date getDate() {
		return (Date) date.clone();
	}

	public void setDate(Date date) {
		this.date = (Date) date.clone();
	}

	public String getIp() {
		return ip;
	}
	

	public String getLuceneQuery() {
		return luceneQuery;
	}

	public void setLuceneQuery(String luceneQuery) {
		this.luceneQuery = luceneQuery;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public Integer getHits() {
		return hits;
	}

	public void setHits(Integer hits) {
		this.hits = hits;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getSortBy() {
		return sortBy;
	}

	public void setSortBy(String sortBy) {
		this.sortBy = sortBy;
	}

	public String getSpatialFilter() {
		return spatialFilter;
	}

	public void setSpatialFilter(String spatialFilter) {
		this.spatialFilter = spatialFilter;
	}
	
	public String getFormattedDate() {
		return formattedDate;
	}

	public void setFormattedDate(String formattedDate) {
		this.formattedDate = formattedDate;
	}

	public void setService(String service) {
		this.service = service;
	}

	public String getService() {
		return service;
	}
	
	public void setAutoGeneratedQuery(boolean autoGenQuery) {
		this.autoGenQuery = autoGenQuery;
	}

	public boolean getAutoGeneratedQuery() {
		return autoGenQuery;
	}

	/**
	 * sets simpleQuery value and returns this value:
	 * true if this Query is simple:
	 * its QueryInfos elements concern only Lucene +any, or +type, or kantone elements 
	 * => if queryInfo has a field different from:
	 * (any, type, _isTemplate, _locale) then its an advanced query<br/>
	 * todo: move list of fields into a configuration; to avoid hard-coded values to guess if query is simple
	 * @return if this query is simple.
	 */
	public boolean isSimpleQuery() {
		simpleQuery = false;
		
		if (this.queryInfos != null) {
			simpleQuery = true;
			for (SearchRequestParam qi : this.queryInfos) {
				if ( LuceneQueryParamType.MATCH_ALL_DOCS == qi.getQueryType() ||
				        !"any".equals(qi.getTermField()) &&
						! "type".equals(qi.getTermField()) &&
						! "_owner".equals(qi.getTermField()) &&
						! qi.getTermField().contains("_op") &&
						! "_isTemplate".equals(qi.getTermField()) &&
						! "_locale".equals(qi.getTermField())) {
					simpleQuery = false;
					break;
				}
			}
		}
		return simpleQuery;
	}

	/**
	 * Stores this object to.
	 * @param context
	 * @return
	 */
    public boolean storeToDb(ServiceContext context) {
        SearchRequestRepository requestRepo = context.getBean(SearchRequestRepository.class);
        // prepares a transaction to log all or nothing into database.

        //Connection con = null;
        //--- generate a new metadata id
        SearchRequest request = new SearchRequest();
        request.setAutogenerated(this.autoGenQuery);
        request.setHits(this.hits);
        request.setIpAddress(this.ip);
        request.setLang(this.language);
        request.setLuceneQuery(this.luceneQuery);
        request.setMetadataType(this.mdType.name());
        request.setRequestDate(new ISODate(this.date.getTime(), false));
        request.setService(this.service);
        request.setSimple(this.isSimpleQuery());
        request.setSortBy(this.sortBy);
        request.setSpatialFilter(this.spatialFilter);

        // stores each QueryInfo object into the database
        if (this.queryInfos != null && !this.autoGenQuery) {
            request.addAll(this.queryInfos);
        } else {
            if (this.autoGenQuery) {
                if (Log.isDebugEnabled(Geonet.SEARCH_LOGGER)) {
                    Log.debug(Geonet.SEARCH_LOGGER, "Guiservice/autogenerated query not inserted into database: " + this.luceneQuery);
                }
            } else {
                if (Log.isDebugEnabled(Geonet.SEARCH_LOGGER)) {
                    Log.debug(Geonet.SEARCH_LOGGER, "No queryInfo objects to insert into database for this query: " + this.luceneQuery);
                }
            }
        }

        requestRepo.save(request);
        if (Log.isDebugEnabled(Geonet.SEARCH_LOGGER))
            Log.debug(Geonet.SEARCH_LOGGER, "QueryRequest inserted (id: " + this.requestId + ")");
        return true;
    }

}
