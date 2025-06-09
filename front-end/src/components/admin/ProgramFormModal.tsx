import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Trash2, PlusCircle, Upload } from "lucide-react";
import type {
  Program,
  ProgramLocation,
  PackageTier,
  Pricing,
  TierLocationHotels,
} from "@/types/program";

// Internal state types to ensure stable keys
type FormRoomPrice = { id: string; name: string; price: number };
type FormPricingCombination = { [combinationKey: string]: FormRoomPrice[] };
type FormPackageTier = Omit<PackageTier, "pricing_combinations"> & {
  id: string;
  name: string;
  pricing_combinations: FormPricingCombination;
};

type ProgramFormData = Omit<Partial<Program>, "packages"> & {
  imageFile?: File | null;
  packages?: FormPackageTier[];
};

interface ProgramFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onProgramSaved: () => void;
  programToEdit?: Program | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialFormData: ProgramFormData = {
  title: "",
  description: "",
  image: "",
  imageFile: null,
  program_type: "umrah",
  includes: [],
  locations: [],
  packages: [],
};

const defaultRoomTypes = ["quintuple", "quad", "triple", "double", "single"];

const getHotelCombinations = (
  locations: ProgramLocation[],
  tierData: FormPackageTier
): string[] => {
  if (!locations || locations.length === 0) return [];
  const hotelArrays = locations.map(
    (loc) =>
      tierData.location_hotels?.[loc.name]?.hotels
        .map((h) => h.name)
        .filter(Boolean) || []
  );
  if (hotelArrays.some((arr) => arr.length === 0)) return [];
  return hotelArrays.reduce<string[]>((acc, current) => {
    if (acc.length === 0) return current;
    return acc.flatMap((c) => current.map((h) => `${c}_${h}`));
  }, []);
};

const ProgramFormModal = ({
  isOpen,
  onOpenChange,
  onProgramSaved,
  programToEdit,
}: ProgramFormModalProps) => {
  const [formData, setFormData] = useState<ProgramFormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!programToEdit;

  // Effect to transform initial program data into a stable state structure for the form
  useEffect(() => {
    if (isOpen) {
      if (isEditing && programToEdit) {
        const packagesArray: FormPackageTier[] = Object.entries(
          programToEdit.packages || {}
        ).map(([name, tierData]) => {
          const formPricingCombinations: FormPricingCombination = {};
          for (const key in tierData.pricing_combinations) {
            formPricingCombinations[key] = Object.entries(
              tierData.pricing_combinations[key]
            ).map(([roomName, price]) => ({
              id: `room_${Math.random()}`,
              name: roomName,
              price,
            }));
          }
          return {
            id: `tier_${Math.random()}`,
            name,
            ...tierData,
            pricing_combinations: formPricingCombinations,
          };
        });
        setFormData({
          ...programToEdit,
          packages: packagesArray,
          imageFile: null,
        });
        setImagePreview(programToEdit.image);
      } else {
        setFormData(initialFormData);
        setImagePreview(null);
      }
    }
  }, [programToEdit, isOpen, isEditing]);

  // Effect to auto-generate pricing combinations when hotels change
  useEffect(() => {
    if (!isOpen) return;
    updateNestedState((draft) => {
      if (!draft.locations || !draft.packages) return;
      draft.packages.forEach((tier) => {
        const existingCombinations = tier.pricing_combinations || {};
        const newCombinations: FormPricingCombination = {};
        const generatedKeys = getHotelCombinations(draft.locations!, tier);

        generatedKeys.forEach((key) => {
          if (existingCombinations[key]) {
            newCombinations[key] = existingCombinations[key];
          } else {
            newCombinations[key] = defaultRoomTypes.map((roomName) => ({
              id: `room_${Math.random()}`,
              name: roomName,
              price: 0,
            }));
          }
        });
        tier.pricing_combinations = newCombinations;
      });
    });
  }, [
    formData.locations,
    JSON.stringify(formData.packages?.map((p) => p.location_hotels) || []),
  ]);

  const updateNestedState = (updateLogic: (draft: ProgramFormData) => void) => {
    setFormData((prev) => {
      const draft = JSON.parse(JSON.stringify(prev));
      updateLogic(draft);
      return draft;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addLocation = () =>
    updateNestedState((draft) => {
      draft.locations = [...(draft.locations || []), { name: "", label: "" }];
    });
  const removeLocation = (index: number) =>
    updateNestedState((draft) => draft.locations?.splice(index, 1));
  const handleLocationChange = (
    index: number,
    field: keyof ProgramLocation,
    value: string
  ) =>
    updateNestedState((draft) => {
      if (draft.locations) draft.locations[index][field] = value;
    });

  const addTier = () =>
    updateNestedState((draft) => {
      const newTier: FormPackageTier = {
        id: `tier_${Date.now()}`,
        name: `new_tier_${(draft.packages?.length || 0) + 1}`,
        nights: 0,
        days: 0,
        location_hotels: {},
        pricing_combinations: {},
      };
      draft.packages = [...(draft.packages || []), newTier];
    });

  const removeTier = (tierId: string) =>
    updateNestedState((draft) => {
      draft.packages = draft.packages?.filter((t) => t.id !== tierId);
    });

  const handleTierChange = (
    tierId: string,
    field: "name" | "nights" | "days",
    value: string | number
  ) =>
    updateNestedState((draft) => {
      const tier = draft.packages?.find((t) => t.id === tierId);
      if (tier) {
        (tier[field] as any) = value;
      }
    });

  const addHotel = (tierId: string, locName: string) =>
    updateNestedState((draft) => {
      const tier = draft.packages?.find((t) => t.id === tierId);
      if (tier) {
        if (!tier.location_hotels) tier.location_hotels = {};
        if (!tier.location_hotels[locName])
          tier.location_hotels[locName] = { hotels: [] };
        tier.location_hotels[locName].hotels.push({ name: "" });
      }
    });

  const removeHotel = (tierId: string, locName: string, hIndex: number) =>
    updateNestedState((draft) => {
      const tier = draft.packages?.find((t) => t.id === tierId);
      if (tier) tier.location_hotels?.[locName]?.hotels.splice(hIndex, 1);
    });

  const handleHotelChange = (
    tierId: string,
    locName: string,
    hIndex: number,
    name: string
  ) =>
    updateNestedState((draft) => {
      const tier = draft.packages?.find((t) => t.id === tierId);
      if (tier?.location_hotels?.[locName]?.hotels[hIndex]) {
        tier.location_hotels[locName].hotels[hIndex].name = name;
      }
    });

  const addRoomPrice = (tierId: string, comboKey: string) =>
    updateNestedState((draft) => {
      const tier = draft.packages?.find((t) => t.id === tierId);
      if (tier?.pricing_combinations?.[comboKey]) {
        tier.pricing_combinations[comboKey].push({
          id: `room_${Date.now()}`,
          name: "new_room",
          price: 0,
        });
      }
    });

  const removeRoomPrice = (tierId: string, comboKey: string, roomId: string) =>
    updateNestedState((draft) => {
      const tier = draft.packages?.find((t) => t.id === tierId);
      if (tier?.pricing_combinations?.[comboKey]) {
        tier.pricing_combinations[comboKey] = tier.pricing_combinations[
          comboKey
        ].filter((r) => r.id !== roomId);
      }
    });

  const handleRoomPriceChange = (
    tierId: string,
    comboKey: string,
    roomId: string,
    field: "name" | "price",
    value: string | number
  ) =>
    updateNestedState((draft) => {
      const tier = draft.packages?.find((t) => t.id === tierId);
      if (tier) {
        const room = tier.pricing_combinations?.[comboKey]?.find(
          (r) => r.id === roomId
        );
        if (room) {
          (room[field] as any) = value;
        }
      }
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, imageFile: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Transform packages back to API format
    const packagesForApi: {
      [tierName: string]: Omit<PackageTier, "name" | "id">;
    } = {};
    formData.packages?.forEach((formTier) => {
      const { id, name, ...tierData } = formTier;
      const apiPricingCombinations: { [key: string]: Pricing } = {};
      for (const comboKey in tierData.pricing_combinations) {
        apiPricingCombinations[comboKey] = tierData.pricing_combinations[
          comboKey
        ].reduce((acc, room) => {
          acc[room.name] = room.price;
          return acc;
        }, {} as Pricing);
      }
      packagesForApi[name] = {
        ...tierData,
        pricing_combinations: apiPricingCombinations,
      };
    });

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title || "");
    dataToSend.append("description", formData.description || "");
    dataToSend.append("program_type", formData.program_type || "umrah");
    dataToSend.append("includes", JSON.stringify(formData.includes || []));
    dataToSend.append("locations", JSON.stringify(formData.locations || []));
    dataToSend.append("packages", JSON.stringify(packagesForApi));

    if (formData.imageFile) {
      dataToSend.append("image", formData.imageFile);
    } else if (isEditing && formData.image) {
      dataToSend.append("image", formData.image);
    }

    try {
      const apiCall = isEditing
        ? axios.post(
            `${API_BASE_URL}/programs/update/${programToEdit!._id}`,
            dataToSend,
            { headers: { "Content-Type": "multipart/form-data" } }
          )
        : axios.post(`${API_BASE_URL}/programs/add`, dataToSend, {
            headers: { "Content-Type": "multipart/form-data" },
          });
      await apiCall;
      onProgramSaved();
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving program:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl max-h-[95vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "تعديل البرنامج" : "إضافة برنامج جديد"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* ... (Main program fields like title, description, image, etc. - no changes here) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">العنوان</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program_type">النوع</Label>
                <Select
                  onValueChange={(v) =>
                    setFormData((p) => ({
                      ...p,
                      program_type: v as Program["program_type"],
                    }))
                  }
                  value={formData.program_type}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="umrah">عمرة</SelectItem>
                    <SelectItem value="tourism">سياحة</SelectItem>
                    <SelectItem value="other">آخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>صورة البرنامج</Label>
                <div className="p-4 border-2 border-dashed rounded-md text-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded-md mb-2"
                    />
                  ) : (
                    <div className="text-gray-500 p-4">لا توجد صورة</div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="ml-2 h-4 w-4" /> تحميل صورة
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2 rounded-md border p-3">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold">المواقع</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addLocation}
                  >
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.locations?.map((loc, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={loc.name}
                        onChange={(e) =>
                          handleLocationChange(index, "name", e.target.value)
                        }
                        placeholder="name (english)"
                      />
                      <Input
                        value={loc.label}
                        onChange={(e) =>
                          handleLocationChange(index, "label", e.target.value)
                        }
                        placeholder="Label (arabic)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLocation(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="includes">الباقة تشمل (كل عنصر في سطر)</Label>
                <Textarea
                  id="includes"
                  name="includes"
                  value={formData.includes?.join("\n")}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      includes: e.target.value.split("\n"),
                    }))
                  }
                  rows={8}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-md border p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">الباقات (Tiers)</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTier}
              >
                <PlusCircle className="ml-2 h-4 w-4" /> إضافة باقة
              </Button>
            </div>
            <Accordion type="multiple" className="w-full">
              {formData.packages?.map((tier) => (
                <AccordionItem
                  value={tier.id}
                  key={tier.id}
                  className="bg-gray-50 rounded-lg mb-2 border"
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2 flex-grow">
                      <Input
                        value={tier.name}
                        onChange={(e) =>
                          handleTierChange(tier.id, "name", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        placeholder="اسم الباقة"
                      />
                      <Input
                        type="number"
                        value={tier.nights}
                        onChange={(e) =>
                          handleTierChange(
                            tier.id,
                            "nights",
                            Number(e.target.value)
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        placeholder="الليالي"
                        className="w-24"
                      />
                      <Input
                        type="number"
                        value={tier.days || ""}
                        onChange={(e) =>
                          handleTierChange(
                            tier.id,
                            "days",
                            Number(e.target.value)
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        placeholder="الأيام"
                        className="w-24"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTier(tier.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-2 space-y-4">
                    <div className="p-3 bg-white rounded border space-y-2">
                      <Label className="font-semibold">الفنادق في الباقة</Label>
                      {formData.locations?.map((loc) => (
                        <div key={loc.name} className="p-2 border-t">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">{loc.label}</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => addHotel(tier.id, loc.name)}
                            >
                              <PlusCircle className="ml-1 h-3 w-3" /> إضافة
                            </Button>
                          </div>
                          <div className="space-y-1 mt-1">
                            {tier.location_hotels?.[loc.name]?.hotels.map(
                              (h, hIndex) => (
                                <div
                                  key={`${tier.id}-${loc.name}-${hIndex}`}
                                  className="flex items-center gap-1"
                                >
                                  <Input
                                    value={h.name}
                                    onChange={(e) =>
                                      handleHotelChange(
                                        tier.id,
                                        loc.name,
                                        hIndex,
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeHotel(tier.id, loc.name, hIndex)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-white rounded border space-y-2">
                      <Label className="font-semibold">تسعيرات الباقة</Label>
                      {Object.entries(tier.pricing_combinations || {}).map(
                        ([key, prices]) => (
                          <div key={key} className="p-2 border-t space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={key}
                                readOnly
                                className="bg-gray-100"
                                placeholder="تركيبة الفنادق"
                              />
                            </div>
                            <div className="pl-4 space-y-1">
                              {prices.map((room) => (
                                <div
                                  key={room.id}
                                  className="flex items-center gap-1"
                                >
                                  <Input
                                    value={room.name}
                                    onChange={(e) =>
                                      handleRoomPriceChange(
                                        tier.id,
                                        key,
                                        room.id,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    placeholder="نوع الغرفة"
                                  />
                                  <Input
                                    type="number"
                                    value={room.price}
                                    onChange={(e) =>
                                      handleRoomPriceChange(
                                        tier.id,
                                        key,
                                        room.id,
                                        "price",
                                        Number(e.target.value)
                                      )
                                    }
                                    placeholder="السعر"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeRoomPrice(tier.id, key, room.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="link"
                                size="sm"
                                onClick={() => addRoomPrice(tier.id, key)}
                              >
                                إضافة سعر غرفة
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit">حفظ البرنامج</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProgramFormModal;
