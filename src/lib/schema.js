// src/lib/schema.js
import { z } from 'zod';

// Zod Schemas for Form Validation
export const schoolDetailsSchema = z.object({
  name: z.string().min(3, { message: "School name must be at least 3 characters." }),
  address: z.string().min(10, { message: "Address is required." }),
  board: z.string().min(2, { message: "Board is required." }),
  logoUrl: z.string().optional(), // For file upload, we'll handle actual file separately
});

export const classSchema = z.object({
  name: z.string().min(1, { message: "Class name is required." }),
  grade: z.coerce.number().min(1, { message: "Grade must be at least 1." }),
  syllabus: z.string().min(5, { message: "Syllabus description is required." }),
});

export const bookSchema = z.object({
  title: z.string().min(3, { message: "Book title is required." }),
  isbn: z.string().optional(), // Optional for now
  barcode: z.string().min(5, { message: "Barcode is required." }),
  classId: z.string().optional(), // Will be linked programmatically
});

export const classBookConfigSchema = z.array(
  z.object({
    class: classSchema,
    books: z.array(bookSchema),
  })
).min(1, { message: "At least one class must be configured." });


export const principalDetailsSchema = z.object({
  name: z.string().min(3, { message: "Principal name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number is required." }).optional(), // Optional for now
});

export const teacherSchema = z.object({
  name: z.string().min(3, { message: "Teacher name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  subject: z.string().min(2, { message: "Subject is required." }),
  classIds: z.array(z.string()).min(1, { message: "At least one class must be assigned." }),
});

export const teachersSchema = z.array(teacherSchema).min(1, { message: "At least one teacher must be assigned." });

export const initialContentSchema = z.object({
  file: z.any().optional(), // We'll handle file validation separately if needed
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
});