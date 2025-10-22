export const useFetchTransaction = (period) => {
  const supabase = useSupabaseClient();
  const transactions = ref([]);
  const pending = ref(false);

  const income = computed(() =>
    transactions.value.filter((t) => t.type === "income")
  );
  const expense = computed(() =>
    transactions.value.filter((t) => t.type === "expense")
  );
  const saving = computed(() =>
    transactions.value.filter((t) => t.type === "saving")
  );
  const investment = computed(() =>
    transactions.value.filter((t) => t.type === "investment")
  );

  const incomeCount = computed(() => income.value.length);
  const expenseCount = computed(() => expense.value.length);

  const incomeTotal = computed(() =>
    income.value.reduce((sum, t) => sum + (t.amount || 0), 0)
  );
  const expenseTotal = computed(() =>
    expense.value.reduce((sum, t) => sum + (t.amount || 0), 0)
  );
  const savingTotal = computed(() =>
    saving.value.reduce((sum, t) => sum + (t.amount || 0), 0)
  );
  const investmentTotal = computed(() =>
    investment.value.reduce((sum, t) => sum + (t.amount || 0), 0)
  );

  const fetchTransactions = async () => {
    pending.value = true;
    try {
      const { data, error } = await supabase
        .from("transaction")
        .select()
        .gte("created_at", period.value.from.toISOString())
        .lte("created_at", period.value.to.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        transactions.value = [];
        return;
      }

      transactions.value = data || [];
    } catch (err) {
      console.error(err);
      transactions.value = [];
    } finally {
      pending.value = false;
    }
  };

  const refresh = async () => {
    await fetchTransactions();
  };

  watch(period, fetchTransactions, { immediate: true });

  const transactionsGroupedByDate = computed(() => {
    const grouped = {};
    for (const t of transactions.value) {
      const date = t.created_at.split("T")[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(t);
    }
    return grouped;
  });

  return {
    transactions: {
      all: transactions,
      grouped: { byDate: transactionsGroupedByDate },
      income,
      expense,
      saving,
      investment,
      incomeTotal,
      expenseTotal,
      savingTotal,
      investmentTotal,
      incomeCount,
      expenseCount,
    },
    refresh,
    pending,
  };
};
