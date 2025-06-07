import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Program } from "@/types/program";
import ProgramFormModal from "./ProgramFormModal";

const ProgramList = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<Program | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = () => {
    const token = localStorage.getItem("token"); // Get the token from localStorage
    axios
      .get("http://localhost:5000/programs/", {
        headers: {
          "x-auth-token": token, // Include the token in the headers
        },
      })
      .then((response) => {
        setPrograms(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the programs!", error);
      });
  };

  const getProgramTypeLabel = (type: string) => {
    switch (type) {
      case "umrah":
        return "عمرة";
      case "tourism":
        return "سياحة";
      default:
        return "آخر";
    }
  };

  // --- CRUD Handlers ---

  const handleAddProgram = () => {
    setProgramToEdit(null); // Ensure we are not editing
    setIsFormModalOpen(true);
  };

  const handleEditProgram = (program: Program) => {
    setProgramToEdit(program);
    setIsFormModalOpen(true);
  };

  const handleDeleteProgram = (id: string) => {
    setProgramToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    const token = localStorage.getItem("token"); // Get the token
    if (programToDelete) {
      axios
        .delete(`http://localhost:5000/programs/${programToDelete}`, {
          headers: {
            "x-auth-token": token, // Include the token
          },
        })
        .then(() => {
          fetchPrograms();
        })
        .catch((err) => console.error("Error deleting program:", err))
        .finally(() => {
          setProgramToDelete(null);
          setShowDeleteDialog(false);
        });
    }
  };

  const handleProgramSaved = () => {
    fetchPrograms(); // Refresh list after add/edit
  };

  return (
    <div>
      <ProgramFormModal
        isOpen={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onProgramSaved={handleProgramSaved}
        programToEdit={programToEdit}
      />

      <div className="flex justify-end mb-4">
        <Button onClick={handleAddProgram}>إضافة برنامج جديد</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان البرنامج</TableHead>
              <TableHead>نوع البرنامج</TableHead>
              <TableHead className="text-center">عدد الباقات</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.length > 0 ? (
              programs.map((program) => (
                <TableRow key={program._id}>
                  <TableCell className="font-medium">{program.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getProgramTypeLabel(program.program_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {Object.keys(program.packages).length}
                  </TableCell>
                  <TableCell>
                    {new Date(program.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditProgram(program)}
                        >
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProgram(program._id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  لا توجد برامج. قم بإضافة برنامج جديد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف البرنامج بشكل
              دائم من خوادمنا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              نعم، قم بالحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProgramList;
