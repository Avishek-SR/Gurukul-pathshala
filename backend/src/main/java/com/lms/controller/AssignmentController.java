package com.lms.controller;

import com.lms.model.Assignment;
import com.lms.service.AssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // Faculty creates a new assignment
    @PostMapping
    public ResponseEntity<Assignment> create(@RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentService.createAssignment(assignment));
    }

    // Get all assignments (real DB data)
    @GetMapping
    public ResponseEntity<List<Assignment>> getAll() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    // Get assignment by id
    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getById(id));
    }

    // Delete (deactivate) an assignment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
