package com.example.omdb.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class MovieSummary {
    @JsonProperty("Title")
    private String title;
    
    @JsonProperty("Year")
    private String year;
    
    private String imdbID;
    
    @JsonProperty("Type")
    private String type;
    
    @JsonProperty("Poster")
    private String poster;
    
    // Getters and Setters
    @JsonProperty("Title")
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    @JsonProperty("Year")
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    
    @JsonProperty("imdbID")
    public String getImdbID() { return imdbID; }
    public void setImdbID(String imdbID) { this.imdbID = imdbID; }
    
    @JsonProperty("Type")
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    @JsonProperty("Poster")
    public String getPoster() { return poster; }
    public void setPoster(String poster) { this.poster = poster; }
}