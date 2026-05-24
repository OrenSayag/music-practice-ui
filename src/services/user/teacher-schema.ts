import { z } from 'zod';
import { SUPPORTED_LANGUAGES } from '@/i18n/languages';

const languageEnumValues = SUPPORTED_LANGUAGES.map((l) => l.code) as [string, ...string[]];

// Keep in sync with music-practice-api/src/modules/user/dto.ts:teacherSchema
export const teacherSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().regex(/^\+?\d{8,15}$/),
  language: z.enum(languageEnumValues),
});

export const teacherPatchSchema = teacherSchema.partial();

export type Teacher = z.infer<typeof teacherSchema>;
export type TeacherPatch = z.infer<typeof teacherPatchSchema>;

export function isCompleteTeacher(value: TeacherPatch | null | undefined): value is Teacher {
  return teacherSchema.safeParse(value).success;
}
