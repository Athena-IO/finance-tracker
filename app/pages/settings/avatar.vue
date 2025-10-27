<template>
  <div>
    <div class="mb-4">
      <UFormField
        label="Current avatar"
        class="w-full"
        help="This would be blank by default"
      >
        <div class="flex gap-24 items-center">
          <UAvatar :src="url" size="3xl" />
          <img :src="url" class="w-1/2 h-1/2" />
        </div>
      </UFormField>
    </div>

    <div class="mb-4">
      <UFormField
        label="New avatar"
        class="w-full"
        name="avatar"
        help="After choosing an image click Save to actually upload the new avatar"
      >
        <UInput type="file" @change="onFileChange" />
      </UFormField>
    </div>

    <UButton
      type="submit"
      color="black"
      variant="solid"
      label="Save"
      :loading="uploading"
      :disabled="uploading"
      @click="saveAvatar"
    />
  </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { toastSuccess, toastError } = useAppToast();
const { url } = useAvatarUrl();

const uploading = ref(false);
const fileInput = ref(null);

const onFileChange = (event) => {
  fileInput.value = event.target.files[0];
};

const saveAvatar = async () => {
  const file = fileInput.value;
  const img = new Image();
  img.src = URL.createObjectURL(file);

  if (!file) {
    toastError({ title: "Select a file to upload first" });
    return;
  }
  if (file.size >= 2000000) {
    toastError({ title: "the file is over sized pls choose another one" });
    return;
  }
  if (img.width >= 1920 && img.height >= 1080) {
    toastError({
      title:
        "the file is too over sized pls choose smaller picture width='1920 or less' height='1080 or less'",
    });
  }
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  try {
    uploading.value = true;

    const currentAvatarUrl = user.value.user_metadata?.avatar_url;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);
    if (uploadError) throw uploadError;

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: fileName },
    });
    if (updateError) throw updateError;

    if (currentAvatarUrl) {
      const { error: removeError } = await supabase.storage
        .from("avatars")
        .remove([currentAvatarUrl]);
      if (removeError)
        console.warn("Could not remove old avatar:", removeError.message);
    }

    const { data: refreshedUser, error: refreshError } =
      await supabase.auth.getUser();
    if (refreshError) throw refreshError;
    user.value = refreshedUser.user;

    toastSuccess({ title: "Avatar uploaded successfully!" });
  } catch (error) {
    toastError({
      title: "Error uploading avatar",
      description: error.message,
    });
  } finally {
    uploading.value = false;
  }
};
</script>
