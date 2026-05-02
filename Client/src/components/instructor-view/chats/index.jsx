import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import CourseChat from "@/components/student-view/CourseChat";
import { getRoomByCourseIdService } from "@/services/mediahandle";

function InstructorChats({ listOfCourses }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);

  useEffect(() => {
    if (!selectedCourse) return;

    async function fetchRoom() {
      try {
        setLoadingRoom(true);
        const res = await getRoomByCourseIdService(selectedCourse._id);
        if (res?.success) {
          setRoomId(res.room._id);
        } else {
          setRoomId(null);
        }
      } catch (err) {
        console.error("Failed to fetch room:", err);
        setRoomId(null);
      } finally {
        setLoadingRoom(false);
      }
    }

    fetchRoom();
  }, [selectedCourse]);

  return (
    <Card className="flex flex-col h-[80vh]">
      <CardHeader>
        <CardTitle>Live Chats</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 overflow-hidden gap-4 p-4 pt-0">
        <div className="w-1/3 border rounded-md bg-muted/20 flex flex-col overflow-hidden">
          <div className="p-3 bg-muted font-semibold border-b">Your Courses</div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {listOfCourses?.map((course) => (
                <button
                  key={course._id}
                  onClick={() => setSelectedCourse(course)}
                  className={`p-3 text-left hover:bg-muted transition-colors border-b last:border-b-0 ${
                    selectedCourse?._id === course._id ? "bg-muted font-medium border-l-4 border-l-primary" : ""
                  }`}
                >
                  <p className="text-sm line-clamp-2">{course.title}</p>
                </button>
              ))}
              {(!listOfCourses || listOfCourses.length === 0) && (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No courses published yet.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="w-2/3 border rounded-md flex flex-col overflow-hidden">
          {!selectedCourse ? (
             <div className="flex-1 flex items-center justify-center text-muted-foreground">
               Select a course to view its live chat
             </div>
          ) : loadingRoom ? (
             <div className="flex-1 flex items-center justify-center text-muted-foreground">
               Loading chat room...
             </div>
          ) : roomId ? (
             <CourseChat courseId={selectedCourse._id} roomId={roomId} />
          ) : (
             <div className="flex-1 flex items-center justify-center text-red-400">
               Chat room could not be loaded. Please ensure the course is saved correctly.
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default InstructorChats;
