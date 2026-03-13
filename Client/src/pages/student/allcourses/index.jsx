import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { filterOptions, sortOptions } from "@/config";
import { fetchStudentViewCourseListService } from "@/services/studentservices/index";
import useStudentStore from "@/store/useStudentStore";
import { ArrowUpDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function StudentViewCoursesPage() {
  const [sort, setSort] = useState("price-lowtohigh");
  const [filters, setFilters] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    loadingState,
    setLoadingState,
  } = useStudentStore();
  const navigate = useNavigate();

  function handleFilterOnChange(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };
    const indexOfCurrentSection = Object.keys(cpyFilters).indexOf(getSectionId);

    if (indexOfCurrentSection === -1) {
      cpyFilters = {
        ...cpyFilters,
        [getSectionId]: [getCurrentOption.id],
      };
    } else {
      const indexOfCurrentOption = cpyFilters[getSectionId].indexOf(
        getCurrentOption.id
      );

      if (indexOfCurrentOption === -1)
        cpyFilters[getSectionId].push(getCurrentOption.id);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }
    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  useEffect(() => {
    const buildQueryStringForFilters = (filters, sort) => {
      const queryParams = new URLSearchParams();

      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value) && value.length > 0) {
          const paramValue = value.join(",");
          queryParams.append(key, paramValue);
        }
      }

      queryParams.append("sortBy", sort);

      return queryParams.toString();
    };

    setSearchParams(new URLSearchParams(buildQueryStringForFilters(filters, sort)));
  }, [filters, sort, setSearchParams]);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, []);

  useEffect(() => {
    async function fetchAllStudentCourses() {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value) && value.length > 0) {
          const paramValue = value.join(",");
          queryParams.append(key, paramValue);
        }
      }
      queryParams.append("sortBy", sort);
  
      try {
        setLoadingState(true);
        const res = await fetchStudentViewCourseListService(queryParams.toString());
        if (res?.success) setStudentViewCoursesList(res.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoadingState(false);
      }
    }
  
    if (filters !== null && sort !== null)
      fetchAllStudentCourses();
  }, [filters, sort, setLoadingState, setStudentViewCoursesList]);

  return (
    <div className="container mx-auto p-4 lg:p-8 bg-background min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-foreground tracking-tight">All Courses</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-4">
          <div className="bg-muted/30 border border-border rounded-2xl p-4 shadow-sm sticky top-20">
            {Object.keys(filterOptions).map((keyItem) => (
              <div key={keyItem} className="p-4 border-b">
                <h3 className="font-bold mb-3 uppercase">{keyItem}</h3>
                <div className="grid gap-2 mt-2">
                  {filterOptions[keyItem].map((option) => (
                    <Label className="flex font-medium items-center gap-3" key={option.id}>
                      <Checkbox
                        checked={
                          filters &&
                          Object.keys(filters).length > 0 &&
                          filters[keyItem] &&
                          filters[keyItem].indexOf(option.id) > -1
                        }
                        onCheckedChange={() =>
                          handleFilterOnChange(keyItem, option)
                        }
                      />
                      {option.label}
                    </Label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex justify-end items-center mb-4 gap-5">
            <span className="text-sm text-muted-foreground font-bold">
              {studentViewCoursesList.length} Results
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 p-5 border-border">
                  <ArrowUpDownIcon className="h-4 w-4" />
                  <span>Sort By</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuRadioGroup value={sort} onValueChange={(value) => setSort(value)}>
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem value={sortItem.id} key={sortItem.id}>
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-4">
            {loadingState ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-2xl" />
              ))
            ) : studentViewCoursesList.length > 0 ? (
              studentViewCoursesList.map((courseItem) => (
                <div
                  key={courseItem._id}
                  onClick={() => navigate(`/course/details/${courseItem._id}`)}
                  className="border border-border rounded-2xl overflow-hidden shadow-sm cursor-pointer flex flex-col md:flex-row gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card group"
                >
                  <div className="overflow-hidden md:w-72 shrink-0">
                    <img
                      src={courseItem.image}
                      width={300}
                      height={150}
                      className="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={courseItem.title}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-2xl mb-2 text-foreground line-clamp-2">{courseItem.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Created by <span className="font-semibold text-foreground/80">{courseItem.instructor_name}</span>
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-bold px-2 py-1 bg-violet-100 text-violet-800 rounded-full">
                        {courseItem.level.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                        {courseItem.primaryLanguage.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-extrabold text-2xl text-primary mt-auto">${courseItem.pricing}</p>
                  </div>
                </div>
              ))
            ) : (
              <h2 className="text-2xl font-bold py-10 text-center">No Courses Found</h2>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentViewCoursesPage;
