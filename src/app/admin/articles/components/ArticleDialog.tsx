import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ArticleForm from "./ArticleForm"

interface ArticleDialogProps {
  mode?: "create" | "edit"
  trigger?: React.ReactNode
  initialData?: {
    title: string
    content: string
    category: string
    status: string
  }
  onSuccess: (data: any) => Promise<void>
}

/**
 * 文章对话框组件
 * @param {ArticleDialogProps} props - 对话框属性
 * @returns {JSX.Element} 对话框组件
 */
export default function ArticleDialog({
  mode = 'create',
  trigger,
  initialData,
  onSuccess,
}: ArticleDialogProps) {
  const [open, setOpen] = React.useState(false)

  const handleSubmit = async (data: any) => {
    try {
      await onSuccess(data)
      setOpen(false)
    } catch (error) {
      console.error("Failed to submit:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {mode === "create" ? "新建文章" : "编辑文章"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "新建文章" : "编辑文章"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "在这里创建一篇新的文章。"
              : "在这里编辑现有的文章。"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ArticleForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 