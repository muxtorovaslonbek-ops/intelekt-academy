import React, { useState, useRef } from 'react';
import { Course, Lesson, LessonAttachment } from '../../types';
import { saveMediaFile, formatFileSize } from '../../lib/mediaStorage';
import {
  X,
  Plus,
  Video,
  FileText,
  Image as ImageIcon,
  Upload,
  Trash2,
  Edit2,
  CheckCircle2,
  Film,
  ExternalLink,
  Eye,
  FileUp,
  Sparkles,
  Paperclip,
} from 'lucide-react';

interface LessonManagerModalProps {
  course: Course;
  onClose: () => void;
  onAddLesson: (courseId: string, lesson: Omit<Lesson, 'id'>) => void;
  onUpdateLesson: (courseId: string, lessonId: string, updates: Partial<Lesson>) => void;
  onDeleteLesson: (courseId: string, lessonId: string) => void;
}

export const LessonManagerModal: React.FC<LessonManagerModalProps> = ({
  course,
  onClose,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
}) => {
  // Mode: 'list' | 'add' | 'edit'
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Lesson Form Fields
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('20 daqiqa');
  const [description, setDescription] = useState('');
  const [bunnyVideoId, setBunnyVideoId] = useState('');
  const [libraryId, setLibraryId] = useState('');

  // Uploaded media states
  const [videoUrl, setVideoUrl] = useState('');
  const [videoName, setVideoName] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [attachments, setAttachments] = useState<LessonAttachment[]>([]);

  // Loading & Upload states
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  // Hidden file inputs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDuration('20 daqiqa');
    setDescription('');
    setBunnyVideoId('');
    setLibraryId('');
    setVideoUrl('');
    setVideoName('');
    setPdfUrl('');
    setPdfName('');
    setImageUrl('');
    setImageName('');
    setAttachments([]);
    setEditingLessonId(null);
  };

  const handleStartCreate = () => {
    resetForm();
    setMode('create');
  };

  const handleStartEdit = (lesson: Lesson) => {
    resetForm();
    setEditingLessonId(lesson.id);
    setTitle(lesson.title);
    setDuration(lesson.duration || '20 daqiqa');
    setDescription(lesson.description || '');
    setBunnyVideoId(lesson.bunnyVideoId || '');
    setLibraryId(lesson.libraryId || '');
    setVideoUrl(lesson.videoUrl || '');
    setVideoName(lesson.videoName || '');
    setPdfUrl(lesson.pdfUrl || '');
    setPdfName(lesson.pdfName || '');
    setImageUrl(lesson.imageUrl || '');
    setImageName(lesson.imageName || '');
    setAttachments(lesson.attachments || []);
    setMode('edit');
  };

  // Video Upload Handler
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      const stored = await saveMediaFile(file);
      setVideoUrl(stored.url);
      setVideoName(file.name);
    } catch (err) {
      console.error('Failed to store video:', err);
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // PDF Upload Handler
  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    try {
      const stored = await saveMediaFile(file);
      setPdfUrl(stored.url);
      setPdfName(file.name);
    } catch (err) {
      console.error('Failed to store PDF:', err);
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const stored = await saveMediaFile(file);
      setImageUrl(stored.url);
      setImageName(file.name);
    } catch (err) {
      console.error('Failed to store image:', err);
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Additional Attachments Handler
  const handleAttachmentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAttachment(true);
    try {
      const stored = await saveMediaFile(file);
      const newAtt: LessonAttachment = {
        id: stored.id,
        name: file.name,
        type: stored.type,
        url: stored.url,
        size: stored.sizeFormatted,
        uploadedAt: new Date().toLocaleDateString('uz-UZ'),
      };
      setAttachments((prev) => [...prev, newAtt]);
    } catch (err) {
      console.error('Failed to store attachment:', err);
    } finally {
      setIsUploadingAttachment(false);
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    }
  };

  const handleSubmitLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const lessonData: Omit<Lesson, 'id'> = {
      title: title.trim(),
      duration: duration.trim() || '20 daqiqa',
      description: description.trim() || undefined,
      bunnyVideoId: bunnyVideoId.trim() || undefined,
      libraryId: libraryId.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      videoName: videoName.trim() || undefined,
      videoType: videoUrl ? 'direct' : bunnyVideoId ? 'bunny' : undefined,
      pdfUrl: pdfUrl.trim() || undefined,
      pdfName: pdfName.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      imageName: imageName.trim() || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      isCompleted: false,
      courseName: course.title,
    };

    if (mode === 'create') {
      onAddLesson(course.id, lessonData);
    } else if (mode === 'edit' && editingLessonId) {
      onUpdateLesson(course.id, editingLessonId, lessonData);
    }

    setMode('list');
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Darslar & Media Boshqaruvi</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {course.lessons.length} ta dars
                </span>
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-md">
                Kurs: <strong className="text-slate-700 dark:text-slate-300">{course.title}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'list' && (
              <button
                type="button"
                onClick={handleStartCreate}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Dars Qo'shish</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {mode === 'list' ? (
            /* LIST VIEW */
            <div className="space-y-3">
              {course.lessons.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-500">
                    <Film className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Ushbu kursda hali darslar mavjud emas
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Darslar bo'limiga to'g'ridan-to'g'ri PDF kitoblar, vizual rasmlar va videolarni yuklashingiz mumkin.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartCreate}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Dars Qo'shish</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {course.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {lesson.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>⏱️ {lesson.duration}</span>

                            {/* Badges for uploaded media */}
                            {(lesson.videoUrl || lesson.bunnyVideoId) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium text-[10px]">
                                <Video className="w-3 h-3" />
                                Video
                              </span>
                            )}

                            {lesson.pdfUrl && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-medium text-[10px]">
                                <FileText className="w-3 h-3" />
                                PDF: {lesson.pdfName || 'Qo\'llanma'}
                              </span>
                            )}

                            {lesson.imageUrl && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium text-[10px]">
                                <ImageIcon className="w-3 h-3" />
                                Rasm
                              </span>
                            )}

                            {lesson.attachments && lesson.attachments.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium text-[10px]">
                                <Paperclip className="w-3 h-3" />
                                {lesson.attachments.length} ta fayl
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(lesson)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Tahrirlash</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLesson(course.id, lesson.id)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Darsni o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* CREATE / EDIT FORM */
            <form onSubmit={handleSubmitLesson} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {mode === 'create' ? "➕ Yangi Dars Yaratish" : "✏️ Darsni Tahrirlash"}
                </span>
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  ← Darslar ro'yxatiga qaytish
                </button>
              </div>

              {/* Title & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Dars Mavzusi / Nomi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masalan: Neyrotarmoqlar va Generativ AI asoslari"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Davomiyligi
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="25 daqiqa"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dars Tavsifi & Konspekt Matni
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Darsda o'rganiladigan asosiy tushunchalar va konspekt..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* MEDIA UPLOAD SECTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* 1. VIDEO YUKLASH */}
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Video Darslik</span>
                    </span>
                    {videoUrl && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Yuklangan
                      </span>
                    )}
                  </div>

                  {/* Hidden Input */}
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/mp4,video/webm,video/ogg,video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />

                  {/* Upload Drop Zone / Button */}
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="p-3 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-800 hover:border-blue-500 cursor-pointer text-center space-y-1 bg-white/60 dark:bg-slate-900/60 transition-colors"
                  >
                    <Upload className="w-5 h-5 mx-auto text-blue-500" />
                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {isUploadingVideo ? "Yuklanmoqda..." : "Video fayl tanlash (MP4, WebM)"}
                    </p>
                    <p className="text-[10px] text-slate-400">Kompyuterdan to'g'ridan-to'g'ri yuklash</p>
                  </div>

                  {/* Video URL or Preview */}
                  {videoUrl ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-blue-800 dark:text-blue-300">
                        <span className="truncate max-w-[160px] font-medium">{videoName || 'Yuklangan video'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoUrl('');
                            setVideoName('');
                          }}
                          className="text-rose-500 hover:underline cursor-pointer"
                        >
                          O'chirish
                        </button>
                      </div>
                      <div className="rounded-xl overflow-hidden aspect-video bg-black">
                        <video src={videoUrl} controls className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block">Yoki Bunny / Tashqi Video URL:</span>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://...mp4 yoki video havolasi"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={bunnyVideoId}
                        onChange={(e) => setBunnyVideoId(e.target.value)}
                        placeholder="Bunny Video ID (GUID)"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={libraryId}
                        onChange={(e) => setLibraryId(e.target.value)}
                        placeholder="Bunny Library ID (masalan: 384729)"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <p className="text-[10px] text-indigo-500">
                        Bunny Video ID kiritsangiz, Library ID'ni ham albatta to'ldiring — aks holda video topilmaydi (404).
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. PDF YUKLASH */}
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>PDF Qo'llanma</span>
                    </span>
                    {pdfUrl && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Yuklangan
                      </span>
                    )}
                  </div>

                  {/* Hidden Input */}
                  <input
                    type="file"
                    ref={pdfInputRef}
                    accept="application/pdf,.pdf"
                    onChange={handlePdfFileChange}
                    className="hidden"
                  />

                  {/* Upload Drop Zone / Button */}
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    className="p-3 rounded-xl border-2 border-dashed border-rose-300 dark:border-rose-800 hover:border-rose-500 cursor-pointer text-center space-y-1 bg-white/60 dark:bg-slate-900/60 transition-colors"
                  >
                    <FileUp className="w-5 h-5 mx-auto text-rose-500" />
                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {isUploadingPdf ? "Yuklanmoqda..." : "PDF hujjat yuklash"}
                    </p>
                    <p className="text-[10px] text-slate-400">Kitob, qo'llanma yoki konspekt (.pdf)</p>
                  </div>

                  {/* PDF State or Direct URL */}
                  {pdfUrl ? (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                          {pdfName || 'Darslik_Qo\'llanmasi.pdf'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setPdfUrl('');
                            setPdfName('');
                          }}
                          className="text-rose-500 hover:underline text-[11px] cursor-pointer"
                        >
                          O'chirish
                        </button>
                      </div>
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:underline font-semibold"
                      >
                        <Eye className="w-3 h-3" />
                        <span>PDF ni tekshirib ko'rish</span>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block">Yoki to'g'ridan-to'g'ri PDF URL:</span>
                      <input
                        type="text"
                        value={pdfUrl}
                        onChange={(e) => {
                          setPdfUrl(e.target.value);
                          if (!pdfName) setPdfName('Qo\'llanma.pdf');
                        }}
                        placeholder="https://.../kitob.pdf"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {/* 3. RASM / SXEMA YUKLASH */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Rasm / Sxema</span>
                    </span>
                    {imageUrl && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Yuklangan
                      </span>
                    )}
                  </div>

                  {/* Hidden Input */}
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/png,image/jpeg,image/webp,image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  {/* Upload Drop Zone / Button */}
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="p-3 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 cursor-pointer text-center space-y-1 bg-white/60 dark:bg-slate-900/60 transition-colors"
                  >
                    <Upload className="w-5 h-5 mx-auto text-emerald-500" />
                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {isUploadingImage ? "Yuklanmoqda..." : "Rasm fayl tanlash"}
                    </p>
                    <p className="text-[10px] text-slate-400">Infografika, slayd yoki sxema (.png, .jpg)</p>
                  </div>

                  {/* Image Preview or Direct URL */}
                  {imageUrl ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300">
                        <span className="truncate max-w-[160px] font-medium">{imageName || 'Yuklangan rasm'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl('');
                            setImageName('');
                          }}
                          className="text-rose-500 hover:underline cursor-pointer"
                        >
                          O'chirish
                        </button>
                      </div>
                      <div className="rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-700">
                        <img src={imageUrl} alt="Lesson preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block">Yoki Rasm URL havolasi:</span>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://.../rasm.png"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 4. QO'SHIMCHA MATERIALLAR (EXTRA ATTACHMENTS) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-indigo-500" />
                    <span>Qo'shimcha Fayllar & Materiallar ({attachments.length})</span>
                  </span>

                  <input
                    type="file"
                    ref={attachmentInputRef}
                    onChange={handleAttachmentFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => attachmentInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Fayl qo'shish</span>
                  </button>
                </div>

                {attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachments.map((att, i) => (
                      <div
                        key={att.id || i}
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{att.name}</p>
                            <span className="text-[10px] text-slate-400">{att.size || 'Fayl'}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                          className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    Qo'shimcha ZIP fayllar, kod namunalari yoki konspektlar qo'shishingiz mumkin.
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('list');
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{mode === 'create' ? "Darsni Saqlash" : "O'zgarishlarni Saqlash"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
