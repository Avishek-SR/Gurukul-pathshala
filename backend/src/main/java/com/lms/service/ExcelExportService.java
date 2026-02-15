package com.lms.service;

import com.lms.model.User;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    public ByteArrayInputStream usersToExcel(List<User> users, com.lms.model.Role role) {
        String[] columns;
        if (role == com.lms.model.Role.STUDENT) {
            columns = new String[] { "User ID", "Name", "Email", "Role", "Program", "Section", "Mobile", "Parent Email",
                    "Parent Phone", "Gender", "Status" };
        } else if (role == com.lms.model.Role.FACULTY) {
            columns = new String[] { "User ID", "Name", "Email", "Role", "Department", "Designation", "Mobile",
                    "Personal Email", "Gender", "Status" };
        } else if (role == com.lms.model.Role.ADMIN) {
            columns = new String[] { "User ID", "Name", "Email", "Role", "Department", "Designation", "Mobile",
                    "Personal Email", "Status" };
        } else {
            // Default/Generic for mixed roles
            columns = new String[] { "User ID", "Name", "Role", "Email", "Department", "Designation", "Status",
                    "Mobile" };
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Users");

            // Header Font
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.BLACK.getIndex());

            // Header Cell Style
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Row for Header
            Row headerRow = sheet.createRow(0);

            // Header
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Cell Style for Content
            int rowIdx = 1;
            for (User user : users) {
                Row row = sheet.createRow(rowIdx++);
                int colIdx = 0;

                if (role == com.lms.model.Role.STUDENT) {
                    row.createCell(colIdx++).setCellValue(user.getUserId());
                    row.createCell(colIdx++).setCellValue(user.getName());
                    row.createCell(colIdx++).setCellValue(user.getEmail());
                    row.createCell(colIdx++).setCellValue(user.getRole().name());
                    row.createCell(colIdx++).setCellValue(user.getProgram() != null ? user.getProgram() : "N/A");
                    row.createCell(colIdx++).setCellValue(user.getSection() != null ? user.getSection() : "N/A");
                    row.createCell(colIdx++)
                            .setCellValue(user.getMobileNumber() != null ? user.getMobileNumber() : "N/A");
                    row.createCell(colIdx++)
                            .setCellValue(user.getParentEmail() != null ? user.getParentEmail() : "N/A");
                    row.createCell(colIdx++)
                            .setCellValue(user.getParentPhoneNumber() != null ? user.getParentPhoneNumber() : "N/A");
                    row.createCell(colIdx++).setCellValue(user.getGender() != null ? user.getGender() : "N/A");
                    row.createCell(colIdx++).setCellValue(user.isActive() ? "Active" : "Inactive");
                } else if (role == com.lms.model.Role.FACULTY) {
                    row.createCell(colIdx++).setCellValue(user.getUserId());
                    row.createCell(colIdx++).setCellValue(user.getName());
                    row.createCell(colIdx++).setCellValue(user.getEmail());
                    row.createCell(colIdx++).setCellValue(user.getRole().name());
                    row.createCell(colIdx++).setCellValue(user.getDepartment() != null ? user.getDepartment() : "N/A");
                    row.createCell(colIdx++)
                            .setCellValue(user.getDesignation() != null ? user.getDesignation() : "N/A");
                    row.createCell(colIdx++)
                            .setCellValue(user.getMobileNumber() != null ? user.getMobileNumber() : "N/A");
                    row.createCell(colIdx++)
                            .setCellValue(user.getPersonalEmail() != null ? user.getPersonalEmail() : "N/A");
                    row.createCell(colIdx++).setCellValue(user.getGender() != null ? user.getGender() : "N/A");
                    row.createCell(colIdx++).setCellValue(user.isActive() ? "Active" : "Inactive");
                } else if (role == com.lms.model.Role.ADMIN) {
                    row.createCell(colIdx++).setCellValue(user.getUserId());
                    row.createCell(colIdx++).setCellValue(user.getName());
                    row.createCell(colIdx++).setCellValue(user.getEmail());
                    row.createCell(colIdx++).setCellValue(user.getRole().name());
                    row.createCell(colIdx++).setCellValue(user.getDepartment() != null ? user.getDepartment() : "N/A");
                    row.createCell(colIdx++)
                            .setCellValue(user.getDesignation() != null ? user.getDesignation() : "N/A");
                    row.createCell(colIdx++)
                            .setCellValue(user.getMobileNumber() != null ? user.getMobileNumber() : "N/A");
                    row.createCell(colIdx++)
                            .setCellValue(user.getPersonalEmail() != null ? user.getPersonalEmail() : "N/A");
                    row.createCell(colIdx++).setCellValue(user.isActive() ? "Active" : "Inactive");
                } else {
                    // Default logic
                    row.createCell(colIdx++).setCellValue(user.getUserId());
                    row.createCell(colIdx++).setCellValue(user.getName());
                    row.createCell(colIdx++).setCellValue(user.getRole().name());
                    row.createCell(colIdx++).setCellValue(user.getEmail());
                    row.createCell(colIdx++).setCellValue(user.getDepartment() != null ? user.getDepartment() : "N/A");
                    row.createCell(colIdx++)
                            .setCellValue(user.getDesignation() != null ? user.getDesignation() : "N/A");
                    row.createCell(colIdx++).setCellValue(user.isActive() ? "Active" : "Inactive");
                    row.createCell(colIdx++)
                            .setCellValue(user.getMobileNumber() != null ? user.getMobileNumber() : "N/A");
                }
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("fail to import data to Excel file: " + e.getMessage());
        }
    }
}
