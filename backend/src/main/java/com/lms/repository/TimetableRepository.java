package com.lms.repository;

import com.lms.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {

        // Find by specific course
        List<Timetable> findByCourseId(Long courseId);

        // Find by class (Program and Section) via Course (Include courses with NULL or
        // Empty Section)
        @Query("SELECT t FROM Timetable t WHERE t.course.program = :program AND (t.course.section = :section OR t.course.section IS NULL OR t.course.section = '') ORDER BY t.dayOfWeek, t.startTime")
        List<Timetable> findByProgramAndSection(@Param("program") String program, @Param("section") String section);

        @Query("SELECT t FROM Timetable t WHERE t.course.program = :program AND (t.course.section = :section OR t.course.section IS NULL OR t.course.section = '') AND t.shift = :shift ORDER BY t.dayOfWeek, t.startTime")
        List<Timetable> findByProgramAndSectionAndShift(@Param("program") String program,
                        @Param("section") String section,
                        @Param("shift") String shift);

        // Find by Faculty via Course
        @Query("SELECT t FROM Timetable t WHERE t.course.faculty.id = :facultyId ORDER BY t.dayOfWeek, t.startTime")
        List<Timetable> findByFacultyId(@Param("facultyId") Long facultyId);

        // Check for overlap (Program/Section) AND Shift (Include Common Courses in
        // check)
        @Query("SELECT COUNT(t) > 0 FROM Timetable t WHERE t.course.program = :program AND (t.course.section = :section OR t.course.section IS NULL OR t.course.section = '') AND t.shift = :shift AND t.dayOfWeek = :day AND "
                        +
                        "((:start < t.endTime AND :end > t.startTime))")
        boolean existsByClassOverlap(@Param("program") String program, @Param("section") String section,
                        @Param("shift") String shift,
                        @Param("day") Timetable.DayOfWeek day, @Param("start") java.time.LocalTime start,
                        @Param("end") java.time.LocalTime end);

        // Check for overlap for a specific faculty
        @Query("SELECT COUNT(t) > 0 FROM Timetable t WHERE t.course.faculty.id = :facultyId AND t.dayOfWeek = :day AND "
                        +
                        "((:start < t.endTime AND :end > t.startTime))")
        boolean existsByFacultyOverlap(@Param("facultyId") Long facultyId,
                        @Param("day") Timetable.DayOfWeek day, @Param("start") java.time.LocalTime start,
                        @Param("end") java.time.LocalTime end);

        // Check for room overlap
        @Query("SELECT COUNT(t) > 0 FROM Timetable t WHERE t.roomNumber = :room AND t.dayOfWeek = :day AND " +
                        "((:start < t.endTime AND :end > t.startTime))")
        boolean existsByRoomOverlap(@Param("room") String room,
                        @Param("day") Timetable.DayOfWeek day, @Param("start") java.time.LocalTime start,
                        @Param("end") java.time.LocalTime end);

        // Delete by Program and Section
        @org.springframework.data.jpa.repository.Modifying
        @Query("DELETE FROM Timetable t WHERE t.course.id IN (SELECT c.id FROM Course c WHERE c.program = :program AND (c.section = :section OR c.section IS NULL OR c.section = ''))")
        void deleteByProgramAndSection(@Param("program") String program, @Param("section") String section);
}
