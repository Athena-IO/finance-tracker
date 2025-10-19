<template>
  <UForm :state="state" :schema="schema" @submit.prevent="saveProfile">
    <UFormField class="mb-4" label="Full Name" name="name">
      <UInput v-model="state.name" />
    </UFormField>

    <UFormField
      class="mb-4"
      label="Email"
      name="email"
      help="You will receive a confirmation email on both the old and the new addresses if you modify the email address"
    >
      <UInput v-model="state.email" />
    </UFormField>

    <UButton
      type="submit"
      color="black"
      variant="solid"
      label="Save"
      :loading="pending"
      :disabled="pending"
    />
  </UForm>
</template>

<script setup>
import { z } from "zod";

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const { toastSuccess, toastError } = useAppToast();
const pending = ref(false);

const state = ref({
  name: user.value.user_metadata?.full_name ?? "",
  email: user.value.email ?? "",
});

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
});

const saveProfile = async () => {
  pending.value = true;

  try {
    const data = {
      data: { full_name: state.value.name },
    };

    if (state.value.email !== user.value.email) {
      data.email = state.value.email;
    }

    const { error } = await supabase.auth.updateUser(data);
    if (error) throw error;

    await supabase.auth.refreshSession();
    const { data: refreshedUser, error: refreshError } =
      await supabase.auth.getUser();
    if (refreshError) throw refreshError;

    user.value = refreshedUser.user;

    toastSuccess({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  } catch (error) {
    toastError({
      title: "Error updating profile",
      description: error.message,
    });
  } finally {
    pending.value = false;
  }
};

watch(user, (newUser) => {
  if (newUser) {
    state.value.name = newUser.user_metadata?.full_name ?? "";
    state.value.email = newUser.email ?? "";
  }
});
</script>
