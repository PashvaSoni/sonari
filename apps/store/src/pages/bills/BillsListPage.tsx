import type { ReactElement } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  EmptyState,
  FileDown,
  Filter,
  MoreHorizontal,
  PageHeader,
  Plus,
  SearchInput,
  StatusPill,
  toast,
  type StatusPillTone,
} from '@sonari/ui'
import { MOCK_BILL_ROWS } from '../../lib/mock-bills.js'
import type { BillListRowStatus } from '../../types/bill-ui.js'

function statusTone(status: BillListRowStatus): StatusPillTone {
  if (status === 'Paid') return 'success'
  if (status === 'Pending') return 'destructive'
  return 'warning'
}

export function BillsListPage(): ReactElement {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MOCK_BILL_ROWS
    return MOCK_BILL_ROWS.filter(
      (row) =>
        row.no.toLowerCase().includes(q) || row.customer.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title="Bills"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => toast.info('Import — coming with bills API (Week 5+)')}
            >
              <FileDown size={16} aria-hidden />
              Import
            </Button>
            <Button onClick={() => navigate('/bills/new')}>
              <Plus size={16} aria-hidden />
              New Bill
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-4 px-6 py-6 lg:px-8">
        <SearchInput
          containerClassName="max-w-md flex-1"
          placeholder="Search bill or customer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search bills"
        />
        <select
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground"
          aria-label="Date range"
          defaultValue="all"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <Button
          variant="outline"
          onClick={() => toast.info('Filters — coming with bills API')}
        >
          <Filter size={16} aria-hidden />
          Filters
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-6 pb-8 lg:px-8">
        {rows.length === 0 ? (
          <EmptyState
            title="No bills match"
            description="Try a different search, or create a new bill."
            action={
              <Button onClick={() => navigate('/bills/new')}>
                <Plus size={16} aria-hidden />
                New Bill
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="border-b border-border bg-foreground/5 font-medium text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Bill No.</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3 text-right">Items</th>
                  <th className="px-6 py-3 text-right">Gross Wt.</th>
                  <th className="px-6 py-3 text-right">Grand Total</th>
                  <th className="px-6 py-3 text-right">Paid</th>
                  <th className="px-6 py-3 text-right">Balance</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((bill) => (
                  <tr
                    key={bill.id}
                    className="cursor-pointer transition-colors hover:bg-foreground/5"
                    onClick={() =>
                      toast.info('Bill detail opens after bills API (Week 5+)')
                    }
                  >
                    <td className="px-6 py-4 font-mono font-medium text-foreground">
                      {bill.no}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{bill.date}</td>
                    <td className="px-6 py-4 font-medium">{bill.customer}</td>
                    <td className="px-6 py-4 text-right">{bill.items}</td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      {bill.weight}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium">
                      {bill.total}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      {bill.paid}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      {bill.balance}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusPill tone={statusTone(bill.status)}>{bill.status}</StatusPill>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      <MoreHorizontal size={16} className="inline-block" aria-hidden />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
