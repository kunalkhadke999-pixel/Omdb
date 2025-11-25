package com.example.omdb.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

// ============================================================================
// Movie Search Response - Returned from search API
// ============================================================================
@Data
public class MovieSearchResponse {
    @JsonProperty("Search")
    private List<MovieSummary> search;
    
    private String totalResults;
    
    @JsonProperty("Response")
    private String response;
    
    @JsonProperty("Error")
    private String error;
    
    // Getters and Setters
    @JsonProperty("Search")
    public List<MovieSummary> getSearch() { return search; }
    public void setSearch(List<MovieSummary> search) { this.search = search; }
    
    @JsonProperty("totalResults")
    public String getTotalResults() { return totalResults; }
    public void setTotalResults(String totalResults) { this.totalResults = totalResults; }
    
    @JsonProperty("Response")
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    
    @JsonProperty("Error")
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}