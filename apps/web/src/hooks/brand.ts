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

export function useBrand() {
	const queryClient = useQueryClient();

	const getBrandsQuery = useQuery({
		queryKey: ["brands"],
		queryFn: async () => {
			const brands = await getBrands({ data: {} });

			return brands;
		},
	});

	const uploadBrand = useMutation({
		mutationFn: async (data: FormData) => {
			return await uploadBrandLogo({ data });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const createBrandMutation = useMutation({
		mutationFn: async (
			data: Omit<Brand, "id" | "userId" | "createdAt" | "updatedAt">,
		) => {
			await createBrand({
				data: {
					name: data.name,
					logoUrl: data.logoUrl,
					tagline: data.tagline,
					websiteUrl: data.websiteUrl,
					primaryColor: data.primaryColor,
					secondaryColor: data.secondaryColor,
				},
			});
		},
		onSuccess: () => {
			toast.success("Brand created!");
			queryClient.invalidateQueries({ queryKey: ["brands"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const updateBrandMutation = useMutation({
		mutationFn: async (
			data: Partial<Omit<Brand, "userId" | "createdAt" | "updatedAt">>,
		) => {
			await updateBrand({
				data: {
					brandId: data.id ?? "",
					name: data.name,
					logoUrl: data.logoUrl,
					websiteUrl: data.websiteUrl,
					tagline: data.tagline,
					primaryColor: data.primaryColor,
					secondaryColor: data.secondaryColor,
				},
			});
		},
		onSuccess: () => {
			toast.success("Brand updated!");
			queryClient.invalidateQueries({ queryKey: ["brands"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const deleteBrandsMutation = useMutation({
		mutationFn: async (brandIds: string[]) => {
			await deleteBrand({
				data: { brandIds },
			});
		},
		onSuccess: () => {
			toast.success("Brands deleted!");
			queryClient.invalidateQueries({ queryKey: ["brands"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return {
		brands: getBrandsQuery.data,
		isFetching: getBrandsQuery.isFetching,
		createBrand: createBrandMutation.mutateAsync,
		isCreating: createBrandMutation.isPending,
		uploadBrand: uploadBrand.mutateAsync,
		isUploading: uploadBrand.isPending,
		updateBrand: updateBrandMutation.mutateAsync,
		isUpdating: updateBrandMutation.isPending,
		deleteBrands: deleteBrandsMutation.mutateAsync,
		isDeleting: deleteBrandsMutation.isPending,
	};
}
