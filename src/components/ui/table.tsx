import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * 表格组件
 * @param {React.HTMLAttributes<HTMLTableElement>} props - 表格属性
 * @returns {JSX.Element} 表格组件
 */
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

/**
 * 表格头部组件
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - 表格头部属性
 * @returns {JSX.Element} 表格头部组件
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

/**
 * 表格主体组件
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - 表格主体属性
 * @returns {JSX.Element} 表格主体组件
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

/**
 * 表格底部组件
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - 表格底部属性
 * @returns {JSX.Element} 表格底部组件
 */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

/**
 * 表格行组件
 * @param {React.HTMLAttributes<HTMLTableRowElement>} props - 表格行属性
 * @returns {JSX.Element} 表格行组件
 */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

/**
 * 表格头部单元格组件
 * @param {React.ThHTMLAttributes<HTMLTableCellElement>} props - 表格头部单元格属性
 * @returns {JSX.Element} 表格头部单元格组件
 */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

/**
 * 表格单元格组件
 * @param {React.TdHTMLAttributes<HTMLTableCellElement>} props - 表格单元格属性
 * @returns {JSX.Element} 表格单元格组件
 */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

/**
 * 表格标题组件
 * @param {React.HTMLAttributes<HTMLTableCaptionElement>} props - 表格标题属性
 * @returns {JSX.Element} 表格标题组件
 */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} 