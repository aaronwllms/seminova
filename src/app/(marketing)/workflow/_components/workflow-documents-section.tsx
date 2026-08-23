import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { WORKFLOW_DOCUMENTS } from '../_lib/workflow-page-content'
import { WORKFLOW_SECTION_SCROLL_CLASS } from '../_lib/workflow-anchor-links'

export const WorkflowDocumentsSection = () => (
  <section aria-labelledby="the-documents" className="border-t py-10">
    <div className="mx-auto max-w-3xl px-4 sm:px-0">
      <h2
        className={`${WORKFLOW_SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
        id="the-documents"
      >
        The documents
      </h2>
      <p className="text-muted-foreground mt-4 max-w-prose text-[15px] leading-relaxed">
        A small, stable document set keeps planning and implementation aligned.
        Each has a clear owner and audience.
      </p>
    </div>

    <div className="mx-auto mt-6 max-w-6xl overflow-x-auto px-4 sm:px-0">
      <div className="bg-card overflow-hidden rounded-xl border">
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
                <TableCell className="font-mono text-sm font-medium">
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:underline"
                  >
                    {document.name}
                  </a>
                </TableCell>
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
    </div>
  </section>
)
