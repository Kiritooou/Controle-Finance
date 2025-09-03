import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionHistory } from './components/TransactionHistory';
import { Goals } from './components/Goals';
import { Reports } from './components/Reports';
import { Charts } from './components/Charts';
import { Categories } from './components/Categories';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Transaction, Category, Goal } from './types';
import { defaultCategories } from './data/defaultCategories';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('financial-transactions', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('financial-categories', defaultCategories);
  const [goals, setGoals] = useLocalStorage<Goal[]>('financial-goals', []);

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const handleEditTransaction = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleAddGoal = (goal: Goal) => {
    setGoals([...goals, goal]);
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(goals.map(g => 
      g.id === updatedGoal.id ? updatedGoal : g
    ));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleAddCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...category, id: uuidv4() };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories(categories.map(c => 
      c.id === updatedCategory.id ? updatedCategory : c
    ));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={sortedTransactions} 
            categories={categories} 
            goals={goals}
            onAddTransaction={handleAddTransaction}
          />
        );
      case 'history':
        return (
          <TransactionHistory 
            transactions={sortedTransactions}
            categories={categories}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'goals':
        return (
          <Goals 
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case 'reports':
        return (
          <Reports 
            transactions={sortedTransactions}
            goals={goals}
            categories={categories}
          />
        );
      case 'charts':
        return (
          <Charts 
            transactions={sortedTransactions}
            categories={categories}
          />
        );
      case 'categories':
        return (
          <Categories
            categories={categories}
            transactions={transactions}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      default:
        return (
          <Dashboard 
            transactions={sortedTransactions} 
            categories={categories} 
            goals={goals}
            onAddTransaction={handleAddTransaction}
          />
        );
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
