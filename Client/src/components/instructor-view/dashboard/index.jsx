import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";

function InstructorDashboard({ listOfCourses }) {
  function calculateTotalStudentsAndProfit() {
    if (!listOfCourses || listOfCourses.length === 0) {
      return { totalStudents: 0, totalProfit: 0, studentList: [], courseAnalytics: [] };
    }

    return listOfCourses.reduce(
      (acc, course) => {
        const students = course.students || [];
        const courseRevenue = course.pricing * students.length;
        
        acc.totalStudents += students.length;
        acc.totalProfit += courseRevenue;
        
        acc.courseAnalytics.push({
          name: course.title,
          students: students.length,
          revenue: courseRevenue
        });

        students.forEach((student) => {
          acc.studentList.push({
            courseTitle: course.title,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
          });
        });
        return acc;
      },
      { totalStudents: 0, totalProfit: 0, studentList: [], courseAnalytics: [] }
    );
  }

  const { totalStudents, totalProfit, studentList, courseAnalytics } = calculateTotalStudentsAndProfit();

  const handleDownloadCSV = () => {
    const headers = ["Course Name", "Student Name", "Student Email"];
    const csvContent = [
      headers.join(","),
      ...studentList.map(s => `"${s.courseTitle}","${s.studentName}","${s.studentEmail}"`)
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student_list.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  const config = [
    {
      icon: Users,
      label: "Total Students",
      value: totalStudents,
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: totalProfit,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {config.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {courseAnalytics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue By Course</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseAnalytics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="revenue" fill="#8884d8">
                    {courseAnalytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Students By Course</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseAnalytics}
                    dataKey="students"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {courseAnalytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Students List</CardTitle>
          <Button onClick={handleDownloadCSV} size="sm" variant="outline" className="h-8">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentList.map((studentItem, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{studentItem.courseTitle}</TableCell>
                    <TableCell>{studentItem.studentName}</TableCell>
                    <TableCell>{studentItem.studentEmail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InstructorDashboard;