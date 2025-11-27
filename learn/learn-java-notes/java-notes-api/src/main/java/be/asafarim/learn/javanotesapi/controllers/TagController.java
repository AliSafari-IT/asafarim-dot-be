package be.asafarim.learn.javanotesapi.controllers;

import be.asafarim.learn.javanotesapi.services.TagService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@CrossOrigin(origins = "*")
public class TagController {

    private final TagService service;

    public TagController(TagService service) {
        this.service = service;
    }

    /**
     * Get all tags that are currently in use
     */
    @GetMapping
    public List<String> getAllTags() {
        return service.getUsedTags();
    }

    /**
     * Get all tags including unused ones
     */
    @GetMapping("/all")
    public List<String> getAllTagsIncludingUnused() {
        return service.getAllTags();
    }
}
