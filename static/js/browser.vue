<template>
    <div class="col-12">
        <div class="list-group">
            <a 
                v-for="item in items" 
                class="list-group-item list-group-item-action" 
                v-bind:class="{'list-group-item-secondary':item.directory}" 
                v-on:click="click(item.directory, item.filename)"
            >
                {{item.filename}}
            </a>
        </div>
    </div>
</template>
<script>
module.exports = {
    props: ['items', 'f_gfiles', 'cur_path'],
    methods: {
        click: function(dir, filename) {
            if (dir) {
                if (filename != '..')
                    this.f_gfiles(filename)
                else{ //navigate to parent dir
                    this.f_gfiles(this.items[0].parent)
                }
            }else{
                this.play_file(filename)
            }
        },
        
        play_file: function(file) {
            path = ''
            if (this.cur_path) {
                path = this.cur_path + '/'
            }
            path = '/play?file='+path+file
            fetch(path)
            .then((response) => {
                if(response.ok) {
                    return response.json()
                }
                throw new Error('Can not play file')
            }).then((json) => {
                if(!json.success) {
                    throw new Error('The launch of the video failed')
                }
            }).catch((err) => {
                console.log(err)
            })
        }
    }
}
</script>
