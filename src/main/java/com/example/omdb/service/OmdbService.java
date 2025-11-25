package com.example.omdb.service;


import com.example.omdb.model.MovieDetail;
import com.example.omdb.model.MovieSearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.logging.Logger;
import java.util.logging.Level;

@Service
public class OmdbService {
    
    private static final Logger logger = Logger.getLogger(OmdbService.class.getName());
    
    @Value("${omdb.api.url}")
    private String apiUrl;
    
    @Value("${omdb.api.key}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    
    public OmdbService() {
        this.restTemplate = new RestTemplate();
    }
    
    @Cacheable(value = "movieSearch", key = "#title + '-' + #page")
    public MovieSearchResponse searchMovies(String title, int page) {
        logger.log(Level.INFO, "Fetching movies for title: {0} and page: {1}", new Object[]{title, page});
        
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("apikey", apiKey)
                .queryParam("s", title)
                .queryParam("page", page)
                .toUriString();
        
        try {
            MovieSearchResponse response = restTemplate.getForObject(url, MovieSearchResponse.class);
            logger.log(Level.INFO, "Search response received successfully");
            
            if (response != null) {
                logger.log(Level.INFO, "Response object: response={0}, totalResults={1}", 
                    new Object[]{response.getResponse(), response.getTotalResults()});
                logger.log(Level.INFO, "Search list: {0}", 
                    response.getSearch() != null ? response.getSearch().size() + " movies" : "null");
            } else {
                logger.log(Level.WARNING, "Response is null");
            }
            
            return response;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error fetching movies: " + e.getMessage(), e);
            throw new RuntimeException("Failed to fetch movies from OMDB API", e);
        }
    }
    
    @Cacheable(value = "movieDetail", key = "#imdbId")
    public MovieDetail getMovieDetail(String imdbId) {
        logger.log(Level.INFO, "Fetching movie detail for imdbId: {0}", imdbId);
        
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("apikey", apiKey)
                .queryParam("i", imdbId)
                .queryParam("plot", "full")
                .toUriString();
        
        try {
            MovieDetail detail = restTemplate.getForObject(url, MovieDetail.class);
            logger.log(Level.INFO, "Movie detail received successfully");
            return detail;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error fetching movie detail: " + e.getMessage(), e);
            throw new RuntimeException("Failed to fetch movie detail from OMDB API", e);
        }
    }
}