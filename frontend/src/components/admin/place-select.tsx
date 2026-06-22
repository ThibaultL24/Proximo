// src/components/admin/place-select.tsx
import { useEffect, useState } from "react";
import { fetchPlaces } from "../../api/public";
import type { Place } from "../../types";

interface PlaceSelectProps {
  value?: number;
  onChange: (placeId: number | undefined) => void;
}

export function PlaceSelect({ value, onChange }: PlaceSelectProps) {
  const [regions, setRegions] = useState<Place[]>([]);
  const [departments, setDepartments] = useState<Place[]>([]);
  const [cities, setCities] = useState<Place[]>([]);
  const [districts, setDistricts] = useState<Place[]>([]);

  const [regionId, setRegionId] = useState<number | "">("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [cityId, setCityId] = useState<number | "">("");
  const [districtId, setDistrictId] = useState<number | "">("");

  useEffect(() => {
    fetchPlaces().then(setRegions).catch(() => {});
  }, []);

  useEffect(() => {
    if (!value || regions.length === 0) return;

    async function resolveSelection() {
      for (const region of regions) {
        const depts = await fetchPlaces(region.id);
        for (const dept of depts) {
          if (dept.id === value) {
            setRegionId(region.id);
            setDepartments(depts);
            setDepartmentId(dept.id);
            return;
          }
          const citiesList = await fetchPlaces(dept.id);
          for (const city of citiesList) {
            if (city.id === value) {
              setRegionId(region.id);
              setDepartments(depts);
              setDepartmentId(dept.id);
              setCities(citiesList);
              setCityId(city.id);
              return;
            }
            const districtsList = await fetchPlaces(city.id);
            for (const district of districtsList) {
              if (district.id === value) {
                setRegionId(region.id);
                setDepartments(depts);
                setDepartmentId(dept.id);
                setCities(citiesList);
                setCityId(city.id);
                setDistricts(districtsList);
                setDistrictId(district.id);
                return;
              }
            }
          }
        }
      }
    }

    resolveSelection().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, regions.length]);

  async function handleRegionChange(id: number | "") {
    setRegionId(id);
    setDepartmentId("");
    setCityId("");
    setDistrictId("");
    setDepartments([]);
    setCities([]);
    setDistricts([]);
    onChange(undefined);
    if (id) setDepartments(await fetchPlaces(id));
  }

  async function handleDepartmentChange(id: number | "") {
    setDepartmentId(id);
    setCityId("");
    setDistrictId("");
    setCities([]);
    setDistricts([]);
    onChange(id || undefined);
    if (id) setCities(await fetchPlaces(id));
  }

  async function handleCityChange(id: number | "") {
    setCityId(id);
    setDistrictId("");
    setDistricts([]);
    onChange(id || departmentId || undefined);
    if (id) setDistricts(await fetchPlaces(id));
  }

  function handleDistrictChange(id: number | "") {
    setDistrictId(id);
    onChange(id || cityId || departmentId || undefined);
  }

  const selectClass = "w-full rounded-lg border px-3 py-2 text-sm";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <select value={regionId} onChange={(e) => handleRegionChange(e.target.value ? Number(e.target.value) : "")} className={selectClass}>
        <option value="">Region</option>
        {regions.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
      <select value={departmentId} onChange={(e) => handleDepartmentChange(e.target.value ? Number(e.target.value) : "")} className={selectClass} disabled={!regionId}>
        <option value="">Departement</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <select value={cityId} onChange={(e) => handleCityChange(e.target.value ? Number(e.target.value) : "")} className={selectClass} disabled={!departmentId}>
        <option value="">Ville (optionnel)</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select value={districtId} onChange={(e) => handleDistrictChange(e.target.value ? Number(e.target.value) : "")} className={selectClass} disabled={!cityId}>
        <option value="">Quartier (optionnel)</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
    </div>
  );
}
