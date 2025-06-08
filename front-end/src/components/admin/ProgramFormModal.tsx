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
// Import Program and PackageTier from types/program
import type { Program, ProgramLocation, PackageTier } from "@/types/program";

// Extend ProgramFormData to include 'days' in PackageTier
type ProgramFormData = Partial<Program> & {
  imageFile?: File | null;
  // Ensure PackageTier has 'days' property here for form handling
  packages?: {
    [tierName: string]: Partial<PackageTier> & { days?: number };
  };
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
  packages: {},
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

  useEffect(() => {
    if (isOpen) {
      if (isEditing && programToEdit) {
        const editableProgram = JSON.parse(JSON.stringify(programToEdit));
        setFormData({
          ...editableProgram,
          imageFile: null,
        });
        setImagePreview(editableProgram.image);
      } else {
        setFormData(initialFormData);
        setImagePreview(null);
      }
    }
  }, [programToEdit, isOpen, isEditing]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateNestedState = (updateLogic: (draft: ProgramFormData) => void) => {
    setFormData((prev) => {
      const draft = JSON.parse(JSON.stringify(prev));
      updateLogic(draft);
      return draft;
    });
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
  ) => {
    updateNestedState((draft) => {
      (draft.locations as ProgramLocation[])[index][field] = value;
    });
  };

  const addTier = () =>
    updateNestedState((draft) => {
      const key = `new_tier_${Date.now()}`;
      if (!draft.packages) draft.packages = {};
      draft.packages[key] = {
        nights: 0,
        days: 0, // Initialize days for new tier
        location_hotels: {},
        pricing_combinations: {},
      };
    });
  const removeTier = (tierName: string) =>
    updateNestedState((draft) => {
      delete draft.packages?.[tierName];
    });
  const handleTierChange = (
    oldName: string,
    field: "name" | "nights" | "days", // Add "days" field
    value: string
  ) => {
    updateNestedState((draft) => {
      const packages = draft.packages;
      if (!packages || !packages[oldName]) return;
      const data = packages[oldName];

      if (field === "nights") {
        data.nights = Number(value) || 0;
      } else if (field === "days") {
        // Handle days change
        data.days = Number(value) || 0;
      } else if (field === "name" && value && oldName !== value) {
        delete packages[oldName];
        packages[value] = data;
      }
    });
  };

  const addHotel = (tier: string, loc: string) =>
    updateNestedState((draft) => {
      const hotels = draft.packages?.[tier]?.location_hotels;
      if (hotels) {
        if (!hotels[loc]) hotels[loc] = { hotels: [] };
        hotels[loc].hotels.push({ name: "" });
      }
    });
  const removeHotel = (tier: string, loc: string, hIndex: number) =>
    updateNestedState((draft) => {
      draft.packages?.[tier]?.location_hotels?.[loc]?.hotels.splice(hIndex, 1);
    });

  const handleHotelChange = (
    tier: string,
    loc: string,
    hIndex: number,
    newName: string
  ) => {
    updateNestedState((draft) => {
      const hotelToUpdate =
        draft.packages?.[tier]?.location_hotels?.[loc]?.hotels?.[hIndex];
      if (!hotelToUpdate) return;

      const oldName = hotelToUpdate.name;
      if (oldName === newName || !oldName) {
        hotelToUpdate.name = newName;
        return;
      }

      hotelToUpdate.name = newName;

      const pricingCombinations = draft.packages?.[tier]?.pricing_combinations;
      if (!pricingCombinations) return;

      const locationIndex = draft.locations.findIndex((l) => l.name === loc);
      if (locationIndex === -1) return;

      const keysToUpdate = Object.keys(pricingCombinations);

      for (const key of keysToUpdate) {
        const keySegments = key.split("_");
        if (keySegments.length !== draft.locations.length) continue;

        const hotelsInSegment = keySegments[locationIndex].split(",");
        const hotelIndexInKey = hotelsInSegment.indexOf(oldName);

        if (hotelIndexInKey !== -1) {
          hotelsInSegment[hotelIndexInKey] = newName;
          keySegments[locationIndex] = hotelsInSegment.join(",");
          const newKey = keySegments.join("_");

          if (newKey !== key) {
            const value = pricingCombinations[key];
            delete pricingCombinations[key];
            pricingCombinations[newKey] = value;
          }
        }
      }
    });
  };

  const addCombination = (tier: string) =>
    updateNestedState((draft) => {
      const key = `new_combo_${Date.now()}`;
      if (!draft.packages?.[tier]?.pricing_combinations)
        draft.packages[tier].pricing_combinations = {};
      draft.packages[tier].pricing_combinations[key] = {};
    });
  const removeCombination = (tier: string, key: string) =>
    updateNestedState((draft) => {
      delete draft.packages?.[tier]?.pricing_combinations?.[key];
    });
  const handleCombinationKeyChange = (
    tier: string,
    oldKey: string,
    newKey: string
  ) =>
    updateNestedState((draft) => {
      const prices = draft.packages?.[tier]?.pricing_combinations?.[oldKey];
      if (prices && newKey) {
        delete draft.packages[tier].pricing_combinations[oldKey];
        draft.packages[tier].pricing_combinations[newKey] = prices;
      }
    });

  const addRoomPrice = (tier: string, comboKey: string) =>
    updateNestedState((draft) => {
      const key = `new_room_${Date.now()}`;
      draft.packages[tier].pricing_combinations[comboKey][key] = 0;
    });
  const removeRoomPrice = (tier: string, comboKey: string, room: string) =>
    updateNestedState((draft) => {
      delete draft.packages?.[tier]?.pricing_combinations?.[comboKey]?.[room];
    });
  const handleRoomPriceChange = (
    tier: string,
    comboKey: string,
    oldRoom: string,
    newRoom: string,
    newPrice: number
  ) => {
    updateNestedState((draft) => {
      const prices = draft.packages?.[tier]?.pricing_combinations?.[comboKey];
      if (prices) {
        if (oldRoom !== newRoom) {
          const roomValue = prices[oldRoom];
          delete prices[oldRoom];
          prices[newRoom] = newPrice ?? roomValue;
        } else {
          prices[newRoom] = newPrice;
        }
      }
    });
  };

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

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title || "");
    dataToSend.append("description", formData.description || "");
    dataToSend.append("program_type", formData.program_type || "umrah");
    dataToSend.append("includes", JSON.stringify(formData.includes || []));
    dataToSend.append("locations", JSON.stringify(formData.locations || []));
    dataToSend.append("packages", JSON.stringify(formData.packages || {})); // packages already contains 'days' now

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
              {Object.entries(formData.packages || {}).map(
                ([tierName, tierData]) => (
                  <AccordionItem
                    value={tierName}
                    key={tierName}
                    className="bg-gray-50 rounded-lg mb-2 border"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2 flex-grow">
                        <Input
                          value={tierName}
                          onChange={(e) =>
                            handleTierChange(tierName, "name", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          placeholder="اسم الباقة"
                        />
                        <Input
                          type="number"
                          value={tierData.nights}
                          onChange={(e) =>
                            handleTierChange(tierName, "nights", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          placeholder="الليالي"
                          className="w-24"
                        />
                        <Input // ADDED DAYS INPUT
                          type="number"
                          value={tierData.days || ""} // MODIFIED THIS LINE: Ensure value is a string, even if tierData.days is 0, null, or undefined
                          onChange={(e) =>
                            handleTierChange(tierName, "days", e.target.value)
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
                          removeTier(tierName);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-2 space-y-4">
                      <div className="p-3 bg-white rounded border space-y-2">
                        <Label className="font-semibold">
                          الفنادق في الباقة
                        </Label>
                        {formData.locations?.map((loc) => (
                          <div key={loc.name} className="p-2 border-t">
                            <div className="flex justify-between items-center">
                              <Label className="text-sm">{loc.label}</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => addHotel(tierName, loc.name)}
                              >
                                <PlusCircle className="ml-1 h-3 w-3" />
                                إضافة
                              </Button>
                            </div>
                            <div className="space-y-1 mt-1">
                              {tierData.location_hotels?.[loc.name]?.hotels.map(
                                (h, hIndex) => (
                                  <div
                                    key={`${tierName}-${loc.name}-${hIndex}`}
                                    className="flex items-center gap-1"
                                  >
                                    <Input
                                      value={h.name}
                                      onChange={(e) =>
                                        handleHotelChange(
                                          tierName,
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
                                        removeHotel(tierName, loc.name, hIndex)
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
                        <div className="flex justify-between items-center">
                          <Label className="font-semibold">
                            تسعيرات الباقة
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addCombination(tierName)}
                          >
                            <PlusCircle className="ml-1 h-3 w-3" />
                            إضافة تركيبة
                          </Button>
                        </div>
                        {Object.entries(
                          tierData.pricing_combinations || {}
                        ).map(([key, prices]) => (
                          <div key={key} className="p-2 border-t space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={key}
                                onChange={(e) =>
                                  handleCombinationKeyChange(
                                    tierName,
                                    key,
                                    e.target.value
                                  )
                                }
                                placeholder="HotelA_HotelB..."
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCombination(tierName, key)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="pl-4 space-y-1">
                              {Object.entries(prices).map(([room, price]) => (
                                <div
                                  key={`${key}-${room}`}
                                  className="flex items-center gap-1"
                                >
                                  <Input
                                    value={room}
                                    onChange={(e) =>
                                      handleRoomPriceChange(
                                        tierName,
                                        key,
                                        room,
                                        e.target.value,
                                        price as number
                                      )
                                    }
                                    placeholder="نوع الغرفة"
                                  />
                                  <Input
                                    type="number"
                                    value={price as number}
                                    onChange={(e) =>
                                      handleRoomPriceChange(
                                        tierName,
                                        key,
                                        room,
                                        room,
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
                                      removeRoomPrice(tierName, key, room)
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
                                onClick={() => addRoomPrice(tierName, key)}
                              >
                                إضافة سعر غرفة
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
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
