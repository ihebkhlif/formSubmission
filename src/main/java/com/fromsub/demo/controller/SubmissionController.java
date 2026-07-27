package com.fromsub.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fromsub.demo.model.Submission;
import com.fromsub.demo.service.SubmissionService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @PostMapping
    public Submission createSubmission(@Valid @RequestBody Submission submission) {

        return submissionService.saveSubmission(submission);
    }

    @GetMapping
    public List<Submission> getAll() {
        return submissionService.getAllSubmissions();
    }

    @GetMapping("/{id}")
    public Submission getSubmission(@PathVariable String id) {
        return submissionService.getSubmissionById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteSubmission(@PathVariable String id) {
        submissionService.deleteSubmission(id);
    }

    @PutMapping("/{id}")
    public Submission updateSubmission(@PathVariable String id, @RequestBody Submission Submission) {
        return submissionService.updateSubmission(id, Submission);
    }

}
