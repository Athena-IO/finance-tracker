<template>
  <UModal v-model:open="isOpen" title="Add Transaction">
    <template #body>
      <UForm :state="state" :schema="schema" ref="form" @submit="save">
        <UFormField
          :required="true"
          label="Transaction Type"
          name="type"
          class="mb-4"
        >
          <USelectMenu
            placeholder="Select the transaction type"
            :items="types"
            v-model="state.type"
          />
        </UFormField>

        <UFormField label="Amount" :required="true" name="amount" class="mb-4">
          <UInput type="number" placeholder="Amount" v-model="state.amount" />
        </UFormField>

        <UFormField
          label="Transaction date"
          :required="true"
          name="created_at"
          class="mb-4"
        >
          <UInput
            type="date"
            icon="i-heroicons-calendar-days-20-solid"
            v-model="state.created_at"
          />
        </UFormField>

        <UFormField
          label="Description"
          hint="Optional"
          name="description"
          class="mb-4"
        >
          <UInput placeholder="Description" v-model="state.description" />
        </UFormField>

        <UFormField
          :required="true"
          label="Category"
          name="category"
          class="mb-4"
          v-if="state.type == 'expense'"
        >
          <USelectMenu
            placeholder="Category"
            :items="categories"
            v-model="state.category"
          />
        </UFormField>

        <UButton
          type="submit"
          color="black"
          variant="solid"
          label="Save"
          :loading="isLoading"
        />
      </UForm>
    </template>
  </UModal>
</template>

<script setup>
import { categories, types } from "~/constants";
import { z } from "zod";
import { useToast } from "#imports";
import { useSupabaseClient } from "#imports";

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue", "saved"]);
const supabase = useSupabaseClient();
const toast = useToast();

const initialState = {
  type: undefined,
  amount: 0,
  created_at: undefined,
  description: undefined,
  category: undefined,
};
const state = ref({ ...initialState });
const form = ref();
const isLoading = ref(false);

const resetForm = () => {
  Object.assign(state.value, initialState);
  form.value?.clear();
};

const defaultschema = z.object({
  created_at: z.string(),
  description: z.string().optional(),
  amount: z.number().positive("Amount needs to be more than 0"),
});
const Incomeschema = z.object({ type: z.literal("income") });
const Investmentschema = z.object({ type: z.literal("investment") });
const Savingschema = z.object({ type: z.literal("saving") });
const Expenseschema = z.object({
  type: z.literal("expense"),
  category: z.enum(categories),
});
const schema = z.intersection(
  z.discriminatedUnion("type", [
    Incomeschema,
    Investmentschema,
    Savingschema,
    Expenseschema,
  ]),
  defaultschema
);

const save = async () => {
  if (form.value.errors.length) return;

  isLoading.value = true;
  try {
    const { error } = await supabase
      .from("transactions")
      .upsert({ ...state.value });

    if (!error) {
      toast.add({
        title: "Transaction saved",
        icon: "i-heroicons-check-circle",
      });
      isOpen.value = false;
      emit("saved");
      return;
    }

    throw error;
  } catch (e) {
    toast.add({
      title: "Transaction not saved",
      description: e.message,
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) resetForm();
    emit("update:modelValue", value);
  },
});
</script>
