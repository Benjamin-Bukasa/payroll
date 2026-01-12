import React from "react"
import Input from "../ui/input"
import { useSearch } from "../../store/searchStore"
import { Controller, useForm } from "react-hook-form"
import Button from "../ui/button"
import { SearchIcon, Bell, CalendarDays, Plus } from "lucide-react"

const SearchForm = () => {

    const searchAction = useSearch((s) => s.search)
    
      const {
        control,
        handleSubmit,
        formState: { errors },
      } = useForm({
        defaultValues: { search: null },
      })
    
      const onSubmit = async (data) => {
        await searchAction(data.search)
      }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex item-center justify-end gap-4">
            <Controller
            name="search"
            control={control}
            render={({ field }) => (
                <Input
                {...field}
                type="search"
                placeholder="Rechercher..."
                className='w-full'
                error={errors.search?.message}
                />
            )}
            />
            <Button className={'w-9 h-9 rounded-lg flex items-center justify-center p-2'} buttonStyle={false}>
                <SearchIcon size={16}/>
            </Button>
    </form>
  );
}

export default SearchForm;
