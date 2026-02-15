package com.lms.dto;

import java.time.LocalDate;
import java.util.List;

public class BatchAttendanceDTO {
    private Long courseId;
    private LocalDate date;
    private List<StudentAttendanceDTO> students;

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public List<StudentAttendanceDTO> getStudents() {
        return students;
    }

    public void setStudents(List<StudentAttendanceDTO> students) {
        this.students = students;
    }

    public static class StudentAttendanceDTO {
        private String studentId;
        private boolean present;

        public String getStudentId() {
            return studentId;
        }

        public void setStudentId(String studentId) {
            this.studentId = studentId;
        }

        public boolean isPresent() {
            return present;
        }

        public void setPresent(boolean present) {
            this.present = present;
        }
    }
}
