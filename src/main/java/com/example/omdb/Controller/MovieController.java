package com.example.omdb.Controller;


import com.example.omdb.model.MovieDetail;
import com.example.omdb.model.MovieSearchResponse;
import com.example.omdb.service.OmdbService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.logging.Logger;
import java.util.logging.Level;

@RestController
@RequestMapping("/api/movies")
public class MovieController {
    
    private static final Logger logger = Logger.getLogger(MovieController.class.getName());
    
    private final OmdbService omdbService;
    
    public MovieController(OmdbService omdbService) {
        this.omdbService = omdbService;
    }
    
    @GetMapping("/search")
    public ResponseEntity<MovieSearchResponse> searchMovies(
            @RequestParam String title,
            @RequestParam(defaultValue = "1") int page) {
        
        logger.log(Level.INFO, "Search request - title: {0}, page: {1}", new Object[]{title, page});
        
        if (title == null || title.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            MovieSearchResponse response = omdbService.searchMovies(title, page);
            
            // Debug logging
            logger.log(Level.INFO, "Returning response to frontend: response={0}, totalResults={1}, searchSize={2}", 
                new Object[]{
                    response != null ? response.getResponse() : "null",
                    response != null ? response.getTotalResults() : "null",
                    response != null && response.getSearch() != null ? response.getSearch().size() : "null"
                });
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error in search endpoint: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{imdbId}")
    public ResponseEntity<MovieDetail> getMovieDetail(@PathVariable String imdbId) {
        logger.log(Level.INFO, "Detail request - imdbId: {0}", imdbId);
        
        if (imdbId == null || imdbId.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            MovieDetail detail = omdbService.getMovieDetail(imdbId);
            if (detail != null && "True".equals(detail.getResponse())) {
                return ResponseEntity.ok(detail);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error in detail endpoint: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OMDB Movie Explorer API is running");
    }
}