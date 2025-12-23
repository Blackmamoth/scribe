import type { Brand } from "@scribe/db/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createBrand,
	deleteBrand,
	getBrands,
	updateBrand,
	uploadBrandLogo,
} from "@/functions/brand";
import { authClient } from "@/lib/auth-client";

export function useBrand() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	const brandsQuery = useQuery({
		queryKey: ["brands"],
		queryFn: () => getBrands({ data: {} }),
		enabled: !!session?.user,
	});

	const uploadBrandMutation = useMutation({
		mutationFn: (data: FormData) => uploadBrandLogo({ data }),
		onError: (error) => toast.error(error.message),
	});

	const createBrandMutation = useMutation({
		mutationFn: (
			data: Omit<Brand, "id" | "userId" | "createdAt" | "updatedAt">,
		) =>
			createBrand({
				data: {
					name: data.name,
					logoUrl: data.logoUrl,
					tagline: data.tagline,
					websiteUrl: data.websiteUrl,
					primaryColor: data.primaryColor,
					secondaryColor: data.secondaryColor,
				},
			}),
		onSuccess: () => {
			toast.success("Brand created!");
			queryClient.invalidateQueries({ queryKey: ["brands"] });
		},
		onError: (error) => toast.error(error.message),
	});

	const updateBrandMutation = useMutation({
		mutationFn: (
			data: Partial<Omit<Brand, "userId" | "createdAt" | "updatedAt">>,
		) =>
			updateBrand({
				data: {
					brandId: data.id ?? "",
					name: data.name,
					logoUrl: data.logoUrl,
					websiteUrl: data.websiteUrl,
					tagline: data.tagline,
					primaryColor: data.primaryColor,
					secondaryColor: data.secondaryColor,
				},
			}),
		onSuccess: () => {
			toast.success("Brand updated!");
			queryClient.invalidateQueries({ queryKey: ["brands"] });
		},
		onError: (error) => toast.error(error.message),
	});

	const deleteBrandsMutation = useMutation({
		mutationFn: (brandIds: string[]) =>
			deleteBrand({
				data: { brandIds },
			}),
		onSuccess: () => {
			toast.success("Brands deleted!");
			queryClient.invalidateQueries({ queryKey: ["brands"] });
		},
		onError: (error) => toast.error(error.message),
	});

	return {
		brands: brandsQuery.data,
		isFetching: brandsQuery.isFetching,
		createBrand: createBrandMutation.mutateAsync,
		isCreating: createBrandMutation.isPending,
		uploadBrand: uploadBrandMutation.mutateAsync,
		isUploading: uploadBrandMutation.isPending,
		updateBrand: updateBrandMutation.mutateAsync,
		isUpdating: updateBrandMutation.isPending,
		deleteBrands: deleteBrandsMutation.mutateAsync,
		isDeleting: deleteBrandsMutation.isPending,
	};
}
