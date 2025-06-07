import ProgramList from "@/components/admin/ProgramList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">لوحة التحكم</h1>
        <Card>
          <CardHeader>
            <CardTitle>إدارة البرامج</CardTitle>
            <CardDescription>
              عرض، إضافة، تعديل، وحذف برامج السفر.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgramList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
