import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { WORKFLOW_DOCUMENTS } from '../_lib/workflow-page-content'

export const WorkflowDocumentsSection = () => (
  <section aria-labelledby="the-documents" className="border-t pt-10">
    <h2 className="text-2xl font-semibold tracking-tight" id="the-documents">
      The documents
    </h2>
    <p className="text-muted-foreground mt-4 max-w-prose text-[15px] leading-relaxed">
      A small, stable document set keeps planning and implementation aligned.
      Each has a clear owner and audience — described by role, not by where the
      file lives in the repo.
    </p>
    <div className="mt-6 overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Document</TableHead>
            <TableHead scope="col">Written by</TableHead>
            <TableHead scope="col">Read by</TableHead>
            <TableHead scope="col">Purpose</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {WORKFLOW_DOCUMENTS.map((document) => (
            <TableRow key={document.name}>
              <TableCell className="font-medium">{document.name}</TableCell>
              <TableCell>{document.writtenBy}</TableCell>
              <TableCell>{document.readBy}</TableCell>
              <TableCell className="text-muted-foreground">
                {document.purpose}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </section>
)
