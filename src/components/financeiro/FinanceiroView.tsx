'use client'

import { useCallback, useState } from 'react'
import { FluxoCaixaView } from '@/components/financeiro/FluxoCaixaView'
import { TransactionForm } from '@/components/financeiro/TransactionForm'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import type { Transaction } from '@/types/database'
import type { TransactionFormData } from '@/hooks/useFinanceiro'

export function FinanceiroView() {
  const {
    transactions,
    contas,
    categorias,
    clients,
    loading,
    error,
    summary,
    fetchByMonth,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
  } = useFinanceiro()

  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Transaction | null>(null)

  const handlePeriodChange = useCallback((year: number, month: number) => {
    fetchByMonth(year, month)
  }, [fetchByMonth])

  function openCreate() {
    setSelected(null)
    setModalOpen(true)
  }

  function openEdit(transaction: Transaction) {
    setSelected(transaction)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelected(null)
  }

  async function handleSave(data: TransactionFormData) {
    if (selected) {
      await updateTransaction(selected.id, data)
    } else {
      await createTransaction(data)
    }
    closeModal()
  }

  async function handleDelete(id: string) {
    await deleteTransaction(id)
    closeModal()
  }

  async function handleMarkPaid(id: string) {
    await markAsPaid(id)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-sm text-gray-500">Controle de receitas, despesas e fluxo de caixa</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Erro: {error}
        </div>
      )}

      <FluxoCaixaView
        transactions={transactions}
        summary={summary}
        loading={loading}
        onPeriodChange={handlePeriodChange}
        onSelectTransaction={openEdit}
        onNewTransaction={openCreate}
      />

      <TransactionForm
        open={modalOpen}
        transaction={selected}
        contas={contas}
        categorias={categorias}
        clients={clients}
        onSave={handleSave}
        onDelete={handleDelete}
        onMarkPaid={handleMarkPaid}
        onClose={closeModal}
      />
    </div>
  )
}
