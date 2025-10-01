import Posts from "@/components/Posts";
import Users from "@/components/SuggestedUser";

const PostsPage = () => {
  return (
    <div className="mt-6 flex gap-6 items-start">
      <div className="flex-1 min-w-0">
        <Posts />
      </div>
      <aside className="w-80 shrink-0 hidden lg:block">
        <Users />
      </aside>
    </div>
  );
};

export default PostsPage;
