import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuizPlayer from "@/components/student-view/QuizPlayer";
import Certificate from "@/components/student-view/Certificate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import useAuthStore from "@/store/useAuthStore";
import useStudentStore from "@/store/useStudentStore";
import {
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
  addNoteService,
  getNotesService,
  deleteNoteService,
  addReviewService,
  getCourseReviewsService,
} from "@/services/studentservices/index";
import { getRoomByCourseIdService } from "@/services/mediahandle";
import CourseChat from "@/components/student-view/CourseChat";
import { Check, ChevronLeft, ChevronRight, Play, Trash2, HelpCircle, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const studentCurrentCourseProgress = useStudentStore(
    (state) => state.studentCurrentCourseProgress
  );
  const setStudentCurrentCourseProgress = useStudentStore(
    (state) => state.setStudentCurrentCourseProgress
  );

  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [courseId, setCourseId] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const certificateRef = useRef(null);

  // ── room state ────────────────────────────────────────────────────────────
  const [roomId, setRoomId] = useState(null);

  // ── notes state ───────────────────────────────────────────────────────────
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const videoPlayerRef = useRef(null);

  // ── reviews state ─────────────────────────────────────────────────────────
  const [rating, setRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");
  const [courseReviews, setCourseReviews] = useState([]);

  const { id } = useParams();

  async function fetchCurrentCourseProgress() {
    const response = await getCurrentCourseProgressService(user?.id, id);
    if (response?.success) {
      if (!response?.data?.isPurchased) {
        setLockCourse(true);
      } else {
        const courseDetails = response?.data?.courseDetails;
        const progress = response?.data?.progress;

        setStudentCurrentCourseProgress({ courseDetails, progress });
        setCourseId(courseDetails?._id);

        if (response?.data?.completed) {
          setCurrentLecture(courseDetails?.curriculam[0]);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
          return;
        }

        const curriculum = courseDetails?.curriculam ?? [];

        if (progress?.length === 0) {
          setCurrentLecture(curriculum[0]);
        } else {
          const lastIndexOfViewedAsTrue = progress.reduceRight(
            (acc, obj, index) => (acc === -1 && obj.viewed ? index : acc),
            -1
          );
          const nextIndex = lastIndexOfViewedAsTrue + 1;
          setCurrentLecture(curriculum[nextIndex] ?? curriculum[0]);
        }
      }
    }
  }

  // ── fetch room for this course ────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;

    async function fetchRoom() {
      try {
        const res = await getRoomByCourseIdService(courseId);
        if (res?.success) {
          setRoomId(res.room._id);
        }
      } catch (err) {
        console.error("Failed to fetch room:", err);
      }
    }

    fetchRoom();
  }, [courseId]);

  async function updateCourseProgress() {
    if (currentLecture && courseId) {
      const response = await markLectureAsViewedService(
        user?.id,
        courseId,
        currentLecture._id
      );
      if (response?.success) {
        fetchCurrentCourseProgress();
      }
    }
  }

  async function handleRewatchCourse() {
    const response = await resetCourseProgressService(user?.id, courseId);
    if (response?.success) {
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);
      fetchCurrentCourseProgress();
    }
  }

  async function handleDownloadCertificate() {
    if (!certificateRef.current) return;
    try {
      setIsDownloadingPdf(true);
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      // A4 dimensions: 297x210 mm
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      pdf.save(`${studentCurrentCourseProgress?.courseDetails?.title || "Course"}_Certificate.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  // ── notes logic ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!courseId || !currentLecture?._id || !user?.id) return;
    async function fetchNotes() {
      try {
        const res = await getNotesService(user?.id, courseId, currentLecture._id);
        if (res?.success) setNotes(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchNotes();
  }, [courseId, currentLecture, user?.id]);

  async function handleAddNote() {
    if (!noteText.trim() || !currentLecture || !courseId) return;
    const timestamp = videoPlayerRef.current?.getCurrentTime() || 0;
    try {
      const res = await addNoteService({
        userId: user?.id,
        courseId,
        lectureId: currentLecture._id,
        noteText: noteText.trim(),
        timestamp,
      });
      if (res?.success) {
        setNoteText("");
        const notesRes = await getNotesService(user?.id, courseId, currentLecture._id);
        if (notesRes?.success) setNotes(notesRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteNote(noteId) {
    try {
      const res = await deleteNoteService(noteId, user?.id);
      if (res?.success) {
        setNotes((prev) => prev.filter((n) => n._id !== noteId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = ("0" + date.getUTCSeconds()).slice(-2);
    if (hh) return `${hh}:${("0" + mm).slice(-2)}:${ss}`;
    return `${mm}:${ss}`;
  }

  // ── reviews logic ─────────────────────────────────────────────────────────
  async function fetchReviews() {
    if (!courseId) return;
    const res = await getCourseReviewsService(courseId);
    if (res?.success) setCourseReviews(res.data.reviews || []);
  }

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  async function handleAddReview() {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    const res = await addReviewService(user?.id, user?.userName, courseId, rating, reviewMessage);
    if (res?.success) {
      toast.success("Review submitted!");
      setRating(0);
      setReviewMessage("");
      fetchReviews();
    } else {
      toast.error(res?.message || "Failed to submit review");
    }
  }

  useEffect(() => {
    if (user?.id && id) fetchCurrentCourseProgress();
  }, [id, user?.id]);

  useEffect(() => {
    if (currentLecture?.progressValue >= 0.99) updateCourseProgress();
  }, [currentLecture]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  if (!studentCurrentCourseProgress?.courseDetails && !lockCourse) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground relative overflow-hidden">
      {showConfetti && <Confetti />}
      <Certificate 
        ref={certificateRef}
        studentName={user?.userName}
        courseTitle={studentCurrentCourseProgress?.courseDetails?.title}
        date={studentCurrentCourseProgress?.progress?.[0]?.dateViewed || new Date()}
      />
      <div className="flex items-center justify-between p-4 bg-background border-b border-border">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/student/my-courses")}
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to My Courses Page
          </Button>
          <h1 className="text-lg font-bold hidden md:block">
            {studentCurrentCourseProgress?.courseDetails?.title}
          </h1>
        </div>
        <Button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
          {isSideBarOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 ${isSideBarOpen ? "mr-[400px]" : ""} transition-all duration-300`}
        >
          {currentLecture?.type === "quiz" ? (
            <div style={{ height: "500px" }}>
              <QuizPlayer 
                lecture={currentLecture} 
                onPass={updateCourseProgress} 
              />
            </div>
          ) : (
            <VideoPlayer
              ref={videoPlayerRef}
              width="100%"
              height="500px"
              url={currentLecture?.videoUrl}
              onProgressUpdate={setCurrentLecture}
              progressData={currentLecture}
            />
          )}

          <div className="p-6 bg-background">
            <h2 className="text-2xl font-bold mb-2">{currentLecture?.title}</h2>
          </div>
        </div>
        <div
          className={`fixed top-[64px] right-0 bottom-0 w-[400px] bg-background border-l border-border transition-all duration-300 ${isSideBarOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* changed to 4 cols to accommodate notes tab */}
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid bg-muted w-full grid-cols-5 p-0 h-14">
              <TabsTrigger value="content" className="rounded-none h-full text-xs md:text-sm">
                Content
              </TabsTrigger>
              <TabsTrigger value="overview" className="rounded-none h-full text-xs md:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-none h-full text-xs md:text-sm">
                📝 Notes
              </TabsTrigger>
              <TabsTrigger value="chat" className="rounded-none h-full text-xs md:text-sm">
                💬 Chat
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none h-full text-xs md:text-sm">
                ⭐ Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {studentCurrentCourseProgress?.courseDetails?.curriculam?.map((item) => (
                    <div
                      className={`flex items-center space-x-2 text-sm text-foreground font-bold cursor-pointer p-2 rounded-md ${currentLecture?._id === item._id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                      key={item._id}
                      onClick={() => setCurrentLecture(item)}
                    >
                      {studentCurrentCourseProgress?.progress?.find(
                        (progressItem) => progressItem.lectureId === item._id
                      )?.viewed ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        item.type === "quiz" ? <HelpCircle className="h-4 w-4" /> : <Play className="h-4 w-4" />
                      )}
                      <span>{item?.title}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">About this course</h2>
                  <p className="text-muted-foreground">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ── notes tab ────────────────────────────────────────────── */}
            <TabsContent value="notes" className="flex-1 overflow-hidden h-full flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {notes.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm mt-8">
                      No notes yet for this lecture. Pause and add one!
                    </p>
                  )}
                  {notes.map((note) => (
                    <div key={note._id} className="p-3 bg-muted rounded-lg flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => videoPlayerRef.current?.seekTo(note.timestamp)} 
                          className="text-blue-500 hover:text-blue-400 font-semibold text-xs flex flex-row items-center gap-1"
                        >
                          &#x23F1; {formatTime(note.timestamp)}
                        </button>
                        <button 
                          onClick={() => handleDeleteNote(note._id)} 
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm">{note.noteText}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-border flex gap-2 bg-background">
                <Input 
                  placeholder="Type a note @ current time..." 
                  value={noteText} 
                  onChange={(e) => setNoteText(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()} 
                  className="flex-1"
                />
                <Button onClick={handleAddNote}>Save</Button>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 overflow-hidden h-full">
              {courseId && roomId ? (
                <CourseChat courseId={courseId} roomId={roomId} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  {courseId ? "Loading chat room..." : "Course not loaded yet"}
                </div>
              )}
            </TabsContent>

            {/* ── reviews tab ────────────────────────────────────────────── */}
            <TabsContent value="reviews" className="flex-1 overflow-hidden h-full flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 mb-6">
                  <h3 className="font-bold flex items-center mb-2">Leave a Review</h3>
                  <div className="flex text-yellow-500 gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        onClick={() => setRating(star)}
                        fill={star <= rating ? "currentColor" : "none"}
                        className={`cursor-pointer ${star <= rating ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}`} 
                      />
                    ))}
                  </div>
                  <Input 
                    placeholder="Write a review..." 
                    value={reviewMessage} 
                    onChange={(e) => setReviewMessage(e.target.value)} 
                    className="mb-2"
                  />
                  <Button onClick={handleAddReview} className="w-full">Submit</Button>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-bold">Student Reviews</h3>
                  {courseReviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  ) : (
                    courseReviews.map((r, i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm">{r.userName || "Student"}</span>
                          <div className="flex text-yellow-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`h-3 w-3 ${star <= r.rating ? "fill-current" : "text-gray-300"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm">{r.reviewMessage}</p>
                        <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>You can't view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showCourseCompleteDialog}>
        <DialogContent showOverlay={false} className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <Label>You have completed the course</Label>
              <div className="flex flex-row gap-3">
                <Button onClick={() => navigate("/student/my-courses")}>
                  My Courses Page
                </Button>
                <Button onClick={handleRewatchCourse} variant="outline">Rewatch Course</Button>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-foreground mb-2 font-semibold flex items-center justify-center">
                  Claim your reward!
                </p>
                <Button 
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                   onClick={handleDownloadCertificate}
                   disabled={isDownloadingPdf}
                >
                   {isDownloadingPdf ? "Generating PDF..." : "Download Certificate (PDF)"}
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;