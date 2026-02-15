package com.lms.service;

import com.lms.dto.TimetableDTO;
import java.util.List;

public interface TimetableService {
    TimetableDTO createTimetableEntry(TimetableDTO fullDto);

    void deleteTimetableEntry(Long id);

    List<TimetableDTO> getTimetableByProgramAndSection(String program, String section, String shift);

    List<TimetableDTO> getTimetableForFaculty(Long facultyId);

    void deleteAllTimetables(String program, String section);

    void generateTimetable(String program, String section, String shift, List<String> constraints);
}
