
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import TagsManager from "@/components/admin/tags/TagsManager";

const Tags = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Product Tags</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Product Tags</CardTitle>
        </CardHeader>
        <div className="p-6">
          <TagsManager />
        </div>
      </Card>
    </div>
  );
};

export default Tags;
