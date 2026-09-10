import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Quiz, QuizQuestion, Lesson } from '../types';
import { INITIAL_COURSES, INITIAL_QUIZZES } from '../data/mockData';
import { fetchSupabaseCourses, upsertSupabaseCourse, upsertSupabaseLesson, isSupabaseConfigured } from '../lib/supabase';

export interface FlattenedLesson extends Lesson {
  course_name?: string;
  bunny_video_id?: string;
}

interface CourseContextType {
  courses: Course[];
  quizzes: Quiz[];
  lessons: FlattenedLesson[];
  completedLessons: string[];
  markAsCompleted: (lessonId: string) => void;
  addCourse: (course: Omit<Course, 'id' | 'studentsCount' | 'rating'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  toggleLessonCompleted: (courseId: string, lessonId: string) => void;
  addLessonToCourse: (courseId: string, lesson: Omit<Lesson, 'id'>) => void;
  updateLessonInCourse: (courseId: string, lessonId: string, updates: Partial<Lesson>) => void;
  deleteLessonFromCourse: (courseId: string, lessonId: string) => void;
  addQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  addQuestionToQuiz: (quizId: string, question: Omit<QuizQuestion, 'id'>) => void;
  updateQuestionInQuiz: (quizId: string, questionId: string, updates: Partial<QuizQuestion>) => void;
  deleteQuestionFromQuiz: (quizId: string, questionId: string) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedQuizId: string | null;
  setSelectedQuizId: (id: string | null) => void;
  clearAllCourses: () => void;
  clearAllQuizzes: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>(() => {
    const version = localStorage.getItem('eduplatform-courses-version');
    if (version !== 'v3') {
      localStorage.setItem('eduplatform-courses-version', 'v3');
      localStorage.setItem('eduplatform-courses', JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    }
    const saved = localStorage.getItem('eduplatform-courses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved courses', e);
      }
    }
    return INITIAL_COURSES;
  });

  // Sync with Supabase on mount if configured
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchSupabaseCourses().then((supabaseCourses) => {
        if (supabaseCourses && supabaseCourses.length > 0) {
          setCourses(supabaseCourses);
        }
      });
    }
  }, []);

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('eduplatform-quizzes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved quizzes', e);
      }
    }
    return INITIAL_QUIZZES;
  });

  useEffect(() => {
    localStorage.setItem('eduplatform-courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('eduplatform-quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  const addCourse = (newCourseData: Omit<Course, 'id' | 'studentsCount' | 'rating'>) => {
    const newCourse: Course = {
      ...newCourseData,
      id: crypto.randomUUID(),
      studentsCount: 0,
      rating: 5.0,
    };
    setCourses((prev) => [newCourse, ...prev]);
    upsertSupabaseCourse(newCourse);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) => {
      const updatedList = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      const target = updatedList.find((c) => c.id === id);
      if (target) upsertSupabaseCourse(target);
      return updatedList;
    });
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };


  const toggleLessonCompleted = (courseId: string, lessonId: string) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id !== courseId) return course;
        return {
          ...course,
          lessons: course.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, isCompleted: !lesson.isCompleted }
              : lesson
          ),
        };
      })
    );
  };

  const addLessonToCourse = (courseId: string, lesson: Omit<Lesson, 'id'>) => {
    const newLesson: Lesson = {
      ...lesson,
      id: crypto.randomUUID(),
    };
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          upsertSupabaseLesson(courseId, c.title, newLesson);
          return {
            ...c,
            lessons: [...c.lessons, newLesson],
            lessonsCount: c.lessons.length + 1,
          };
        }
        return c;
      })
    );
  };

  const updateLessonInCourse = (courseId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedLessons = c.lessons.map((l) => {
            if (l.id === lessonId) {
              const merged = { ...l, ...updates };
              upsertSupabaseLesson(courseId, c.title, merged);
              return merged;
            }
            return l;
          });
          return { ...c, lessons: updatedLessons };
        }
        return c;
      })
    );
  };


  const deleteLessonFromCourse = (courseId: string, lessonId: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              lessons: c.lessons.filter((l) => l.id !== lessonId),
              lessonsCount: Math.max(0, c.lessons.length - 1),
            }
          : c
      )
    );
  };

  const clearAllCourses = () => {
    setCourses([]);
    localStorage.removeItem('eduplatform-courses');
  };

  const clearAllQuizzes = () => {
    setQuizzes([]);
    localStorage.removeItem('eduplatform-quizzes');
  };

  const addQuiz = (quizData: Omit<Quiz, 'id'>) => {
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz-${Date.now()}`,
      questionsCount: quizData.questions?.length || 0,
    };
    setQuizzes((prev) => [newQuiz, ...prev]);
  };

  const updateQuiz = (id: string, updates: Partial<Quiz>) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuiz = (id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  const addQuestionToQuiz = (quizId: string, questionData: Omit<QuizQuestion, 'id'>) => {
    const newQuestion: QuizQuestion = {
      ...questionData,
      id: `q-${Date.now()}`,
    };
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId
          ? {
              ...q,
              questions: [...q.questions, newQuestion],
              questionsCount: q.questions.length + 1,
            }
          : q
      )
    );
  };

  const updateQuestionInQuiz = (quizId: string, questionId: string, updates: Partial<QuizQuestion>) => {
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId
          ? {
              ...q,
              questions: q.questions.map((item) => (item.id === questionId ? { ...item, ...updates } : item)),
            }
          : q
      )
    );
  };

  const deleteQuestionFromQuiz = (quizId: string, questionId: string) => {
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId
          ? {
              ...q,
              questions: q.questions.filter((item) => item.id !== questionId),
              questionsCount: Math.max(0, q.questions.length - 1),
            }
          : q
      )
    );
  };

  // Flattened lessons list across all courses with Bunny Video ID
  const lessons: FlattenedLesson[] = courses.flatMap((course) =>
    course.lessons.map((lesson) => ({
      ...lesson,
      course_name: course.title,
      bunny_video_id: lesson.bunnyVideoId || '4a5e3f42-4f05-4c07-9b22-861c8a1495c2',
    }))
  );

  const completedLessons: string[] = lessons.filter((l) => l.isCompleted).map((l) => l.id);

  const markAsCompleted = (lessonId: string) => {
    const targetCourse = courses.find((c) => c.lessons.some((l) => l.id === lessonId));
    if (targetCourse) {
      toggleLessonCompleted(targetCourse.id, lessonId);
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        quizzes,
        lessons,
        completedLessons,
        markAsCompleted,
        addCourse,
        updateCourse,
        deleteCourse,
        toggleLessonCompleted,
        addLessonToCourse,
        updateLessonInCourse,
        deleteLessonFromCourse,
        addQuiz,
        updateQuiz,
        deleteQuiz,
        addQuestionToQuiz,
        updateQuestionInQuiz,
        deleteQuestionFromQuiz,
        selectedCourseId,
        setSelectedCourseId,
        selectedQuizId,
        setSelectedQuizId,
        clearAllCourses,
        clearAllQuizzes,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
}

export const useCourse = useCourses;

